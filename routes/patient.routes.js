import express from "express";
import { errorHandler } from "../helpers/errorHandler.js";
import isAuth from "../middlewares/auth.js";

const router = express.Router();

router.get("/:id",isAuth ,async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!id) return next(errorHandler(400, "missing patient ID"));

		const patient = await User.findById(id, {
			password: 0,
			createdAt: 0,
			updatedAt: 0,
			rate: 0,
			specialization: 0,
			otp: 0,
			otpExpiry: 0,
		});
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

router.get("/all",isAuth ,async (req, res, next) => {
	try {
		const patients = await User.find({ role: "Patient" }).select(
			"-password -createdAt -updatedAt -rate -specialization -otp -otpExpiry"
		);

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
export default router;
