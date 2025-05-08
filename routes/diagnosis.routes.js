import express from "express";
import { errorHandler } from "../helpers/errorHandler";
import Diagnosis from "../models/diagnosis.model";
import isAuth from "../middlewares/auth.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/:patientId/all", isAuth, async (req, res, next) => {
	try {
		const { patientId } = req.params;
		if (!patientId) return next(errorHandler(400, "missing patient ID"));

		const user = req.user;
		if (
			user.role !== "Admin" &&
			user.role !== "Hospital" &&
			Number(patientId) !== Number(user.id)
		)
			return next(errorHandler(401, "unauthorized operation"));

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const diagnoses = await Diagnosis.find({ patient: patientId })
			.populate("doctor")
			.lean();
		if (!diagnoses || diagnoses.length === 0)
			return next(
				errorHandler(404, "No diagnoses found for this patient")
			);

		return res.status(200).json({
			success: true,
			message: "fetched all diagnoses for the patient",
			diagnoses,
		});
	} catch (error) {
		return next(error);
	}
});

router.get("/:patientId/:diagnosisId", isAuth, async (req, res, next) => {
	try {
		const { patientId, diagnosisId } = req.params;
		if (!patientId || !diagnosisId)
			return next(errorHandler(400, "missing patient or diagnosis ID"));

		const user = req.user;
		if (
			user.role !== "Admin" &&
			user.role !== "Hospital" &&
			Number(patientId) !== Number(user.id)
		)
			return next(errorHandler(401, "unauthorized operation"));

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const diagnosis = await Diagnosis.findbyId(diagnosisId)
			.populate("doctor")
			.lean();
		if (!diagnosis)
			return next(
				errorHandler(404, "No diagnosis found for this patient")
			);

		return res.status(200).json({
			success: true,
			message: "fetched all diagnoses for the patient",
			diagnosis,
		});
	} catch (error) {
		return next(error);
	}
});

export default router;
