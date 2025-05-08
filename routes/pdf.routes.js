import express from "express";
import { errorHandler } from "../helpers/errorHandler.js";
import isAuth from "../middlewares/auth.js";

const router = express.Router();

router.get("/diagnosis/:patientId/:diagnosisId?", isAuth ,async (req, res, next) => {
	try {
		const { patientId, diagnosisId } = req.params;
		const showAll = req.query.all === "true";

        const patient = await Patient
	} catch (error) {
		next(errorHandler(500, "internal server error"));
	}
});

export default router;
