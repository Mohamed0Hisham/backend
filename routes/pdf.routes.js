import express from "express";
import { errorHandler } from "../helpers/errorHandler.js";
import isAuth from "../middlewares/auth.js";
import User from "../models/userModel.js";
import Diagnosis from "../models/diagnosis.model.js";
import PDF from "../PDF/service.js";

const router = express.Router();

router.get("/diagnosis/:patientId/all", isAuth, async (req, res, next) => {
	try {
		const { patientId } = req.params;
		if (!patientId)
			return next(errorHandler(400, "missing patient or diagnosis Id"));

		const patient = await User.findById(patientId);
		if (!patient) return next(errorHandler(404, "patient doesn't exist"));

		const diagnoses = await Diagnosis.find({ patient: patientId });
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
		console.log(error.message);
		next(errorHandler(500, "internal server error"));
	}
});

export default router;
