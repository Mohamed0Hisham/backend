import user from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import dotenv from "dotenv";
import { startSession } from "mongoose";
import { errorHandler } from "../helpers/errorHandler.js";
import emailService from "../Mail/emailService.js";
import { invalidateCache } from "../helpers/invalidateCache.js";

dotenv.config();

export const store = async (req, res) => {
  const session = await startSession();
  try {
    session.startTransaction();

    const patientId = req.user._id;
    const patient = await user.findById(patientId).session(session);
    // const doctorId = req.body.doctorId;
    const doctorId = req.params.id;
    const doctor = await user.findById(doctorId);
    const role = req.user.role;
    const { nurseId, priority, appointmentDate } = req.body;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const appointDate = new Date(appointmentDate);
    if (patientId == doctorId) {
      await session.abortTransaction();

      return res.status(400).send({
        success: false,
        message: "can`t book to your self",
      });
    }
    if (appointDate < currentDate) {
      await session.abortTransaction();

      return res.status(400).send({
        success: false,
        message: "Appointment date must be today or in the future.",
      });
    }
    if (role !== "Hospital") {
      const appointment = await Appointment.findOne({
        patientId: patientId,
        doctorId: doctorId,
        appointmentDate: appointmentDate,
      });
      if (appointment) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "can`t book two appointment in the same day",
        });
      }

      const appoint = new Appointment({
        patientId,
        nurseId,
        doctorId,
        priority,
        appointmentDate,
        patientName: patient.name,
        doctorName: doctor.name,
      });
      const savedAppointment = await appoint.save();
      const userId = appoint.patientId;
      if (!doctor) {
        await session.abortTransaction();
        console.error(`doctor not found with id ${doctorId}`);
        return res
          .status(404)
          .json({ success: false, message: "doctor not found" });
      }
      await doctor.updateOne(
        {
          $push: { Appointment: savedAppointment },
          //$push: { appointments: savedAppointment._id },
        },
        { session }
      );
      await user.findByIdAndUpdate(
        { _id: userId },
        { $push: { Appointment: savedAppointment } },
        { session }
      );
      await session.commitTransaction();

      await invalidateCache([`/api/appointments`, "/api/doctor"]);

      res.status(200).json({
        message: "Appointment booked successfully",
        appointment: savedAppointment,
      });
    } else {
      await session.abortTransaction();
      res.status(403).send("Access Denied");
    }
  } catch (error) {
    await session.abortTransaction();
    console.error("Error booking appointment:", error);
    res.status(400).send({
      message: "An error occurred while booking the appointment",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};
export const deleteAppointUser = async (req, res) => {
  const role = req.user.role;
  const userId = req.user._id;
  if (role == "Admin" || role == "Patient") {
    const session = await startSession();
    try {
      session.startTransaction();

      const appointmentId = req.params.id;
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.patientId.toString() !== userId) {
        await session.abortTransaction();

        return res.status(400).send({
          success: false,
          message: "it is not yours.",
        });
      }

      await Appointment.findByIdAndDelete(appointmentId).session(session);
      await user.findByIdAndUpdate(
        { _id: userId },
        { $pull: { Appointment: appointment } },
        { new: true, session }
      );
      await user.findByIdAndUpdate(
        { _id: appointment.doctorId },
        { $pull: { Appointment: appointment } },
        { new: true, session }
      );
      await session.commitTransaction();

      await invalidateCache([
        `/api/appointments/${appointmentId}`,
        `/api/appointments`,
      ]);

      return res.status(200).json({ success: true, message: "book deleted" });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error deleting appointment:", error);
      res.status(500).json({
        message: "An error occurred while deleting the appointment",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  } else {
    res.status(403).json({
      message: "You do not have permission to delete this appointment",
    });
  }
};
export const deleteAppointDoctor = async (req, res) => {
  const role = req.user.role;
  const doctorId = req.user._id;

  if (role === "Admin" || role === "Nurse" || role === "Doctor") {
    const session = await startSession();
    try {
      const appointmentId = req.params.id;
      session.startTransaction();
      const appointment = await Appointment.findById(appointmentId).session(
        session
      );
      if (!appointment) {
        await session.abortTransaction();
        await session.endSession();

        return res.status(404).json({ message: "Appointment not found" });
      }

      // Delete the appointment
      await Appointment.findByIdAndDelete(appointmentId).session(session);

      // Remove the appointment from the doctor's record
      await user.findByIdAndUpdate(
        doctorId,
        { $pull: { Appointment: appointment } },
        { new: true, session }
      );
      await user.findByIdAndUpdate(
        appointment.patientId,
        { $pull: { Appointment: appointment } },
        { session }
      );
      await user.findByIdAndUpdate(
        appointment.patientId,
        {
          $push: {
            Appointment: {
              appointmentId: appointment._id,
              status: "deleted",
            },
          },
        },
        { session }
      );

      // Update the status of the appointment in the patient's record
      /**await user.findByIdAndUpdate(
				appointment.patientId,
				{ $set: { "appointments.$[elem].status": "deleted" } },
				{
					arrayFilters: [{ "elem.appointmentId": appointment._id }],
					new: true,
				}
			);*/

      const patient = await user.findById(appointment.patientId);

      await emailService.sendAppointmentDeletion(
        patient.email,
        appointment.appointmentDate
      );

      await session.commitTransaction();

      await invalidateCache([
        `/api/appointments/${appointmentId}`,
        `/api/appointments`,
      ]);

      res.json({ message: "Appointment deleted successfully", data: [] });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error deleting appointment:", error);
      res.status(500).json({
        message: "An error occurred while deleting the appointment",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  } else {
    res.status(403).json({
      message: "You do not have permission to delete this appointment",
    });
  }
};

export const update = async (req, res) => {
  const role = req.user.role;
  const userId = req.user._id;
  if (role === "Patient" || role === "Admin") {
    const session = await startSession();
    try {
      session.startTransaction();
      const appointmentId = req.params.id;
      const oldAppoint = await Appointment.findById(appointmentId).session(
        session
      );
      if (!oldAppoint) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const doctorId = oldAppoint?.doctorId;
      const newAppointment = req.body;

      // Update appointment
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        /**{ $set: newAppointment },
				 { new: true } // Return updated document*/
        newAppointment
      ).session(session);

      // Remove old appointment from patient
      await user.findByIdAndUpdate(
        userId,
        { $pull: { Appointment: oldAppoint } },
        { session }
      );

      // Add updated appointment to patient
      await user.findByIdAndUpdate(
        userId,
        { $push: { Appointment: newAppointment } },
        { session }
      );

      // Remove old appointment from doctor (if doctor exists)
      if (doctorId) {
        await user.findByIdAndUpdate(
          doctorId,
          { $pull: { Appointment: oldAppoint } },
          { session }
        );

        // Add updated appointment to doctor
        await user.findByIdAndUpdate(
          doctorId,
          { $push: { Appointment: newAppointment } },
          { session }
        );
      }
      await session.commitTransaction();

      await invalidateCache([
        `/api/appointments/${appointmentId}`,
        `/api/appointments`,
      ]);

      res.json({
        message: "Appointment updated successfully",
        data: updatedAppointment,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error updating appointment:", error);
      res.status(500).json({
        message: "An error occurred while updating the appointment",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  } else if (role === "Doctor") {
    const appointmentId = req.params.id;
    const priority = req.body.priority;

    try {
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { $set: { priority: priority } },
        { new: true }
      );

      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      await invalidateCache([
        `/api/appointments/${appointmentId}`,
        `/api/appointments`,
      ]);

      res.json({
        message: "Priority updated successfully",
        data: updatedAppointment,
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      res.status(500).json({
        message: "An error occurred while updating priority",
        error: error.message,
      });
    }
  } else {
    res.status(403).send("Access Denied");
  }
};

export const index = async (req, res, next) => {
  const role = req.user.role;
  const userId = req.user._id;
  if (role === "Admin") {
    try {
      const appointments = await Appointment.find();
      const totalAppointments = await Appointment.countDocuments();

      if (appointments.length === 0) {
        return next(errorHandler(404, "There are no appointments"));
      }
      return res.status(200).json({
        message: "Appointments retrieved successfully",
        data: appointments,
        totalAppointments: totalAppointments,
      });
    } catch (error) {
      return next(
        errorHandler(
          500,
          "An error occurred while retrieving the Appointments. Please try again later." +
            error
        )
      );
    }
  }
  if (role === "Nurse" || role === "Doctor" || role === "Patient") {
    try {
      // Filter based on user role
      let filter = {};
      if (role === "Doctor") {
        filter = { doctorId: userId };
      } else if (role === "Nurse") {
        filter = { nurseId: userId };
      } else if (role === "Patient") {
        filter = { patientId: userId };
      }

      // Pagination setup
      const page = parseInt(req.query.page) || 1;
      const limit = 10; // Number of appointments per page
      const skip = (page - 1) * limit;

      // Fetch appointments with pagination & sorting
      const appointments = await Appointment.find(filter)
        .populate("patientId", "patientName ")
        .populate("doctorId", "doctorName ")
        //.populate("nurseId", "name email")
        .sort({ appointmentDate: 1 }) // Sorts by earliest appointment first
        .skip(skip)
        .limit(limit);

      // Check if no appointments found
      if (appointments.length === 0) {
        return res.status(404).json({ message: "No appointments found" });
      }
      const totalAppointments = await Appointment.countDocuments();
      res.json({
        message: "Appointments retrieved successfully",
        data: appointments,
        totalAppointments: totalAppointments,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({
        message: "An error occurred while fetching appointments",
        error: error.message,
      });
    }
  } else {
    res.status(403).json({ message: "Access Denied" });
  }
};

export const show = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user;
    
    const booking = await Appointment.findById(id);
    if(!booking) return next(errorHandler(404,"this booking Id doesn't exist"))
    
    if(user.role !=="Admin" && user.role !== "Hospital" && user._id !== booking.patientId ) 
      return res.status(403).json({
        success: false,
        message: "un-authorized operation",
      });

    res.status(200).json({
      message: "Appointment data has been retirved successfully",
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "failed to show this appointment",
      error:error.message
    });
  }
};
