import { errorHandler } from "../helpers/errorHandler.js";
import User from "../models/userModel.js";
import Diagnosis from "../models/diagnosis.model.js";
import PDF from "../PDF/service.js";

export const printAllDiagnoses = async (req, res, next) => {
	try {
		const { patientId } = req.params;
		if (!patientId) return next(errorHandler(400, "missing patient ID"));

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const diagnoses = await Diagnosis.find({ patient: patientId })
			.populate({
				path: "doctor",
				select: "-password -createdAt -updatedAt -role -appoints -isVerified -__v",
			})
			.populate("medications")
			.lean();
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
		console.log("error stack 👉", error.stack);
		console.log("error message 👉", error.message);
		next(error);
	}
};

export const printSpecificDiagnosis = async (req, res, next) => {
	try {
		const { patientId, diagnosisId } = req.params;
		if (!patientId || !diagnosisId)
			return next(errorHandler(400, "missing patient or diagnosis ID"));

		const patient = await User.findById(patientId);
		if (!patient || patient.role !== "Patient")
			return next(errorHandler(404, "patient doesn't exist"));

		const diagnosis = await Diagnosis.findById(diagnosisId).populate(
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
};
