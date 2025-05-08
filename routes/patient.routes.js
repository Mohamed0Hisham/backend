import express from "express";
import { errorHandler } from "../helpers/errorHandler.js";
import isAuth from "../middlewares/auth.js";
import User from "../models/userModel.js";
import { hash } from "bcryptjs";

const router = express.Router();

router.get("/:id", isAuth, async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!id) return next(errorHandler(400, "missing patient ID"));

		const user = req.user;
		if (
			Number(user._id) !== Number(id) &&
			user.role !== "Hospital" &&
			user.role !== "Admin"
		)
			return next(errorHandler(401, "Unauthorized operation"));

		const patient = await User.findById(id, {
			password: 0,
			createdAt: 0,
			updatedAt: 0,
			rate: 0,
			specialization: 0,
			otp: 0,
			otpExpiry: 0,
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
});

router.get("/all", isAuth, async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role !== "Admin" && user.role !== "Hospital")
			return next(errorHandler(401, "Unauthorized operation"));

		const patients = await User.find({ role: "Patient" })
			.select(
				"-password -createdAt -updatedAt -rate -specialization -otp -otpExpiry"
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
});

router.post("/new", async (req, res, next) => {
	try {
		const {
			name,
			gender,
			email,
			password,
			phone,
			city,
			country,
			emergencyContact,
			familyHistory,
		} = req.body;

		if (
			!name ||
			!gender ||
			!emergencyContact ||
			!familyHistory ||
			!email ||
			!password ||
			!phone ||
			!city ||
			!country
		) {
			return next(
				errorHandler(400, "Please provide all the required fields")
			);
		}

		const isExist = await User.findOne({ email });
		if (isExist) {
			return next(errorHandler(400, "this email already in use"));
		}

		const hashedPass = await hash(password, 10);

		await User.create({
			name,
			email,
			password: hashedPass,
			gender,
			phone,
			city,
			country,
			emergencyContact,
			familyHistory,
			role: "Patient",
		});

		return res.status(201).json({
			success: true,
			message: "added patient to database",
		});
	} catch (error) {
		return next(error);
	}
});

router.put("/:id", isAuth, async (req, res, next) => {
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
			return next(
				errorHandler(400, "you need to update at least one field")
			);
		}

		const updated = await User.findByIdAndUpdate(id, req.body, {
			new: true,
		}).lean();

		return res.status(200).json({
			success: true,
			message: "patient profile updated",
			data: updated,
		});
	} catch (error) {
		return next(error);
	}
});

router.delete("/:id", isAuth, async (req, res, next) => {
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
		return res.status(200).json({
			success: true,
			message: "patient deleted from database",
		});
	} catch (error) {
		return next(error);
	}
});
export default router;
