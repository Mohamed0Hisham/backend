import express from "express";
import isAuth from "../middlewares/auth.js";
import {
	printAllDiagnoses,
	printSpecificDiagnosis,
} from "../controllers/pdf.controller.js";
import cacheForUser from "../middlewares/cacheForUser.js";

const router = express.Router();

router.get(
	"/diagnosis/:patientId/all",
	isAuth,
	printAllDiagnoses
);

router.get(
	"/diagnosis/:patientId/:diagnosisId",
	isAuth,
	printSpecificDiagnosis
);

export default router;
