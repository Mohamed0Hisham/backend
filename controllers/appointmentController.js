import user from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import dotenv from "dotenv";
import { startSession } from "mongoose";
import { errorHandler } from "../helpers/errorHandler.js";
import emailService from "../Mail/emailService.js";

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

		if (role !== "Admin" && role !== "Hospital") {
			const { nurseId, priority, appointmentDate } = req.body;
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
					.json({ success: false, message: "Tour not found" });
			}
			await doctor.updateOne(
				{
					$push: { appoints: savedAppointment },
					//$push: { appointments: savedAppointment._id },
				},
				{ session }
			);
			await user.findByIdAndUpdate(
				{ _id: userId },
				{ $push: { appoints: savedAppointment } },
				{ session }
			);
			await session.commitTransaction();
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

			const appointment = await Appointment.findById(req.params.id);
			if (!appointment) {
				await session.abortTransaction();
				await session.endSession();
				return res.status(404).json({ message: "Appointment not found" });
			}

			await Appointment.findByIdAndDelete(req.params.id).session(session);
			await user.findByIdAndUpdate(
				{ _id: userId },
				{ $pull: { appoints: appointment } },
				{ new: true, session }
			);
			await user.findByIdAndUpdate(
				{ _id: appointment.doctorId },
				{ $pull: { appoints: appointment } },
				{ new: true, session }
			);
			await session.commitTransaction();
			res.json({ message: "book deleted", data: [] });
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
			session.startTransaction();
			const appointment = await Appointment.findById(req.params.id).session(
				session
			);
			if (!appointment) {
				await session.abortTransaction();
				await session.endSession();

				return res.status(404).json({ message: "Appointment not found" });
			}

			// Delete the appointment
			await Appointment.findByIdAndDelete(req.params.id).session(session);

			// Remove the appointment from the doctor's record
			await user.findByIdAndUpdate(
				doctorId,
				{ $pull: { appoints: appointment } },
				{ new: true, session }
			);
			await user.findByIdAndUpdate(
				appointment.patientId,
				{ $pull: { appoints: appointment } },
				{ session }
			);
			await user.findByIdAndUpdate(
				appointment.patientId,
				{
					$push: {
						appoints: {
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

	if (role === "Patient") {
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
				{ $pull: { appoints: oldAppoint } },
				{ session }
			);

			// Add updated appointment to patient
			await user.findByIdAndUpdate(
				userId,
				{ $push: { appoints: newAppointment } },
				{ session }
			);

			// Remove old appointment from doctor (if doctor exists)
			if (doctorId) {
				await user.findByIdAndUpdate(
					doctorId,
					{ $pull: { appoints: oldAppoint } },
					{ session }
				);

				// Add updated appointment to doctor
				await user.findByIdAndUpdate(
					doctorId,
					{ $push: { appoints: newAppointment } },
					{ session }
				);
			}
			await session.commitTransaction();
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
				
			if (appointments.length === 0) {
				return next(errorHandler(404, "There are no appointments"));
			}
			return res.status(200).json({
				message: "Appointments retrieved successfully",
				data: appointments,
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
	if (role === "Nurse" || role === "Doctor") {
		try {
			// Filter based on user role
			let filter = {};
			if (role === "Doctor") {
				filter = { doctorId: userId };
			} else if (role === "Nurse") {
				filter = { nurseId: userId };
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

			res.json({
				message: "Appointments retrieved successfully",
				data: appointments,
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
	const id = req.params.id;
	try {
		const booking = await Appointment.findById(id);
		res.status(200).json({
			message: "Appointment data has been retirved successfully",
			success: true,
			data: booking,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: "failed to show this appointment",
		});
	}
};
