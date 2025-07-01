import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import emailService from "../Mail/emailService.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../helpers/errorHandler.js";
import { invalidateCache } from "../helpers/invalidateCache.js";

export const fetchPatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(errorHandler(400, "missing patient ID"));

    const user = req.user;
    console.log(typeof user._id);
    console.log(typeof id);
    if (user._id !== id && user.role !== "Hospital" && user.role !== "Admin")
      return next(errorHandler(401, "Unauthorized operation"));

    const patient = await User.findById(id, {
      password: 0,
      createdAt: 0,
      updatedAt: 0,
      rate: 0,
      specialization: 0,
      otp: 0,
      otpExpiry: 0,
      isVerified: 0,
      refreshToken: 0,
      role: 0,
    }).lean();
    if (!patient || patient.role !== "Patient")
      return next(errorHandler(404, "patient doesn't exist at database"));

    return res.status(200).json({
      success: true,
      message: "Patient details are fetched",
      patient,
    });
  } catch (error) {
    return next(error);
  }
};
export const fetchAllPatients = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "Admin" && user.role !== "Hospital")
      return next(errorHandler(401, "Unauthorized operation"));

    const patients = await User.find({ role: "Patient" })
      .select(
        "-role -Appointment -isVerified -refreshToken -password -createdAt -updatedAt -rate -specialization -otp -otpExpiry"
      )
      .lean();

    if (!patients || patients.length === 0) {
      return next(errorHandler(404, "No Patients in the Database!"));
    }

    return res.status(200).json({
      success: true,
      message: "Fetched all the patients in the database",
      patients,
    });
  } catch (error) {
    return next(error);
  }
};

export const registerPatient = async (req, res, next) => {
  try {
    const {
      name,
      gender,
      email,
      dateOfBirth,
      password,
      phone,
      city,
      country,
      emergencyContact,
    } = req.body;

    const missingFields = [];

    if (!name) missingFields.push("name");
    if (!gender) missingFields.push("gender");
    if (!email) missingFields.push("email");
    if (!dateOfBirth) missingFields.push("dateOfBirth");
    if (!password) missingFields.push("password");
    if (!phone) missingFields.push("phone");
    if (!city) missingFields.push("city");
    if (!country) missingFields.push("country");
    if (!emergencyContact) missingFields.push("emergencyContact");

    if (missingFields.length > 0) {
      return next(
        errorHandler(
          400,
          `Missing required fields: ${missingFields.join(", ")}`
        )
      );
    }

    const isExist = await User.findOne({ email }).lean();
    if (isExist) {
      return next(errorHandler(400, "this email already in use"));
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPass,
      gender,
      phone,
      city,
      dateOfBirth,
      country,
      emergencyContact,
      role: "Patient",
    });

    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    await emailService.confirmEmail(email, token);

    await invalidateCache([`/api/patient/all`]);

    return res.status(201).json({
      success: true,
      message: "confirmation email has been sent to your email",
    });
  } catch (error) {
    return next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(errorHandler(400, "missing patient id"));

    const user = req.user;
    if (
      user.role !== "Admin" &&
      user.role !== "Hospital" &&
      Number(id) !== Number(user.id)
    )
      return next(errorHandler(401, "unauthorized operation"));
    const {
      name,
      gender,
      email,
      phone,
      city,
      country,
      emergencyContact,
      familyHistory,
      insuranceInfo,
    } = req.body;

    if (
      !name &&
      !gender &&
      !emergencyContact &&
      !familyHistory &&
      !insuranceInfo &&
      !email &&
      !phone &&
      !city &&
      !country
    ) {
      return next(errorHandler(400, "you need to update at least one field"));
    }

    const updated = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).lean();

    await invalidateCache([`/api/patient/all`, `/api/patient/one/${id}`]);

    return res.status(200).json({
      success: true,
      message: "patient profile updated",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!id) return next(errorHandler(400, "missing patient id"));

    if (
      user.role !== "Admin" &&
      user.role !== "Hospital" &&
      Number(id) !== Number(user.id)
    )
      return next(errorHandler(401, "unauthorized operation"));
    await User.findByIdAndDelete(id);

    await invalidateCache([`/api/patient/all`, `/api/patient/one/${id}`]);

    return res.status(200).json({
      success: true,
      message: "patient deleted from database",
    });
  } catch (error) {
    return next(error);
  }
};
