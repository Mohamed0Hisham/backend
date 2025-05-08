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
			user.role !== "Doctor" &&
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
			user.role !== "Doctor" &&
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

router.post("/", isAuth, async (req, res, next) => {
	try {
		const user = req.user;
		if (
			user.role !== "Admin" &&
			user.role !== "Doctor" &&
			user.role !== "Hospital"
		)
			return next(errorHandler(401, "unauthorized operation"));

		const {
			patientId,
			doctorId,
			title,
			description,
			symptoms,
			medications,
			recommendations,
			followUp,
			notes,
		} = req.body;

		if (
			!patientId ||
			!doctorId ||
			!title ||
			!description ||
			!symptoms ||
			!medications ||
			!recommendations ||
			!followUp ||
			!notes
		)
			return next(errorHandler(400, "missing required fields"));

		if (!Array.isArray(medications))
			return next(
				errorHandler(
					400,
					"provide medications as an array of IDs refrencing treatments collection"
				)
			);
		if (!Array.isArray(symptoms))
			return next(
				errorHandler(400, "provide symptoms as an array of strings")
			);

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const doctor = await User.findById(doctorId);
		if (!doctor || doctor.role !== "Doctor")
			return next(errorHandler(404, "doctor doesn't exist"));

		const diagnosis = await Diagnosis.create({
			patient: patientId,
			doctor: doctorId,
			title,
			description,
			symptoms,
			medications,
			recommendations,
			followUp,
			notes,
		});

		return res.status(201).json({
			success: true,
			message: "new diagnosis added to the patient",
			diagnosis,
		});
	} catch (error) {
		return next(error);
	}
});

router.put("/:patientId/:diagnosisId", isAuth, async (req, res, next) => {
	try {
		const { patientId, diagnosisId } = req.params;
		if (!patientId || !diagnosisId)
			return next(errorHandler(400, "missing patient or diagnosis ID"));

		const user = req.user;
		if (
			user.role !== "Admin" &&
			user.role !== "Doctor" &&
			user.role !== "Hospital"
		)
			return next(errorHandler(401, "unauthorized operation"));

		const diagnosis = await Diagnosis.findById(diagnosisId).lean();
		if (!diagnosis)
			return next(errorHandler(404, "Diagnosis doesn't exist"));

		const patient = await User.findById(patientId).lean();
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const {
			title,
			description,
			symptoms,
			medications,
			recommendations,
			followUp,
			notes,
		} = req.body;

		if (
			!title &&
			!description &&
			!symptoms &&
			!medications &&
			!recommendations &&
			!followUp &&
			!notes
		)
			return next(
				errorHandler(400, "at least one field should be updated")
			);

		const updated = await Diagnosis.findByIdAndUpdate(
			diagnosisId,
			req.body,
			{
				new: true,
			}
		).lean();

		return res.status(200).json({
			success: true,
			message: "Diagnosis updated",
			Diagnosis: updated,
		});
	} catch (error) {
		return next(error);
	}
});

router.delete("/:diagnosisId", isAuth, async (req, res, next) => {
	try {
		const user = req.user;
		if (
			user.role !== "Admin" &&
			user.role !== "Doctor" &&
			user.role !== "Hospital"
		)
			return next(errorHandler(401, "unauthorized operation"));

		const { diagnosisId } = req.params;
		if (!diagnosisId)
			return next(errorHandler(400, "missing diagnosis ID"));

		const diagnosis = await Diagnosis.findById(diagnosisId).lean();
		if (!diagnosis)
			return next(errorHandler(404, "Diagnosis doesn't exist"));

		await Diagnosis.findByIdAndDelete(diagnosisId).lean();

		return res.status(200).json({
			success: true,
			message: "diagnosis deleted successfully",
		});
	} catch (error) {
		return next(error);
	}
});
export default router;
