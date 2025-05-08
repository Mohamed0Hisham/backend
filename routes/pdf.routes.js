import express from "express";
import { errorHandler } from "../helpers/errorHandler.js";
import isAuth from "../middlewares/auth.js";
import User from "../models/userModel.js";
import Diagnosis from "../models/diagnosis.model.js";
import PDF from "../PDF/service.js";

const router = express.Router();

router.get("/diagnosis/:patientId/all", async (req, res, next) => {
	try {
		const { patientId } = req.params;
		if (!patientId) return next(errorHandler(400, "missing patient ID"));

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const diagnoses = await Diagnosis.find({ patient: patientId }).populate(
			"doctor"
		);
		if (!diagnoses || diagnoses.length === 0)
			return next(
				errorHandler(404, "No diagnoses found for this patient")
			);

		const PDFDocument = await PDF.generateDiagnosisPDF(patient, diagnoses);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=diagnosis_${Date.now()}.pdf`
		);
		PDFDocument.pipe(res);
	} catch (error) {
		next(error);
	}
});

router.get("/diagnosis/:patientId/:diagnosisId", async (req, res, next) => {
	try {
		const { patientId, diagnosisId } = req.params;
		if (!patientId || !diagnosisId)
			return next(errorHandler(400, "missing patient or diagnosis ID"));

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const diagnosis = await Diagnosis.findbyId(diagnosisId).populate(
			"doctor"
		);
		if (!diagnosis)
			return next(
				errorHandler(404, "No diagnosis found for this patient")
			);

		const PDFDocument = await PDF.generateDiagnosisPDF(patient, diagnosis);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=diagnosis_${Date.now()}.pdf`
		);
		PDFDocument.pipe(res);
	} catch (error) {
		next(error);
	}
});

export default router;
