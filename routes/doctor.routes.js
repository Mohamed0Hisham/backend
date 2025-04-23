import express from "express";
import authenticateJWT from "../middlewares/auth.js";
import { errorHandler } from "../helpers/errorHandler.js";
import User from "../models/userModel.js";
import { hash } from "bcryptjs";
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

router.post("/new-doctor", async (req, res, next) => {
	const email = req.body.email;
	if (!email) throw new Error("no email provided");

	const isExist = await User.findOne({ email });
	if (isExist) throw new Error("doctor already registered");

	try {
		const {
			name,
			gender,
			email,
			password,
			phone,
			city,
			country,
			specialization,
		} = req.body;
		const hashedPass = await hash(password, 10);
		if (!specialization) specialization = "N/A";

		const user = new User({
			name,
			gender,
			email,
			password: hashedPass,
			phone,
			city,
			country,
			role: "doctor",
			specialization,
		});

		const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		await User.create(user);
		await emailService.confirmEmail(email, token);

		return res.status(201).json({ message: "confirmation email has been sent" });
	} catch (error) {
		return next(errorHandler(500, error.message));
	}
});

export default router;
