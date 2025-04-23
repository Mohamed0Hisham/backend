import express from "express";
import authenticateJWT from "../middlewares/auth.js";
import { errorHandler } from "../helpers/errorHandler.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import emailService from "../Mail/emailService.js";
import jwt from "jsonwebtoken"
const router = express.Router();

router.get("/profile", authenticateJWT, async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role !== "Admin" && user.role !== "Doctor") {
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
			specialization: doctor.specialization,
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
	if (!email) return next(errorHandler(400, "no email provided"));

	const isExist = await User.findOne({ email });
	if (isExist) return next(errorHandler(400, "doctor already registered"));

	try {
		const { name, gender, password, phone, city, country } = req.body;
		let specialization = req.body.specialization;
		if (!specialization) specialization = "N/A";

		const hashedPass = await bcryptjs.hash(password, 10);

		const user = new User({
			name,
			gender,
			email,
			password: hashedPass,
			phone,
			city,
			country,
			role: "Doctor",
			specialization,
		});

		const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		await User.create(user);
		await emailService.confirmEmail(email, token);

		return res
			.status(201)
			.json({ message: "confirmation email has been sent" });
	} catch (error) {
		return next(errorHandler(500, error.message));
	}
});

router.put("/update", authenticateJWT, async (req, res, next) => {
	try {
		const { password, ...rest } = req.body;

		if (!req.body) {
			return res.status(400).json({
				success: false,
				message: "invalid operation",
			});
		}

		if (password && password.length > 0) {
			return res.status(400).json({
				success: false,
				message: "you are fetching the wrong enpoint",
			});
		}

		const userID = req.user._id;
		const doctor = await User.findByIdAndUpdate(userID, req.body, {
			new: true,
		}).lean();

		if (!doctor) {
			return res.status(400).json({
				success: false,
				message: "doctor not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "doctor profile updated",
			doctor,
		});
	} catch (error) {
		console.error("Update Profile Error:", error);
		return next(errorHandler(500, error.message));
	}
});

router.delete("/deletion", authenticateJWT, async (req, res, next) => {
	try {
		const userID = req.user._id;

		await User.findByIdAndDelete(userID);

		return res.status(200).json({
			success: true,
			message: "doctor profile deleted",
		});
	} catch (error) {
		return next(errorHandler(500, error.message));
	}
});
export default router;
