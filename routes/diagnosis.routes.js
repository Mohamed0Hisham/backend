import express from "express";
import { errorHandler } from "../helpers/errorHandler";
import Diagnosis from "../models/diagnosis.model";
import isAuth from "../middlewares/auth.js";

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

		const diagnoses = await Diagnosis.find({ patient: patientId });
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

export default router;
