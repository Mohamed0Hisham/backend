import express from "express";
import authenticateJWT from "../middlewares/auth.js";
import { errorHandler } from "../helpers/errorHandler.js";
import User from "../models/userModel.js";
const router = express.Router();

router.get("/profile", authenticateJWT, async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role !== "Admin" || user.role !== "Doctor") {
			return next(errorHandler(401, "unauthorized operation"));
		}
		const doctor = await User.findById(user._id, {
			name: 1,
			email: 1,
			gender: 1,
			age: 1,
			phone: 1,
			city: 1,
			country: 1,
			specialization: 1,
			appointments: 1,
		})
			.populate(
				"Appointment",
				"patientName nurseId priority appointmentDate status"
			)
			.lean();

		const formatted = {
			name: doctor.name,
			email: doctor.email,
			age: doctor.age,
			gender: doctor.gender,
			phone: doctor.phone,
			city: doctor.city,
			country: doctor.country,
			major: doctor.specialization,
		};

		return res.status(200).json({
			success: true,
			message: "doctor profile fetched",
			doctor: formatted,
			appointments: user.appointments,
		});
	} catch (error) {
		return next(errorHandler(500, error.message));
	}
});

export default router;
