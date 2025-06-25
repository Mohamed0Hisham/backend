import express from "express";
import isAuth from "../middlewares/auth.js";
import {
	printAllDiagnoses,
	printSpecificDiagnosis,
} from "../controllers/pdf.controller.js";
import cachePDF from "../middlewares/cachePDF.js";

const router = express.Router();

router.get(
	"/diagnosis/:patientId/all",
	isAuth,
	cachePDF((req) => `pdf:all:${req.params.patientId}`),
	printAllDiagnoses
);

router.get(
	"/diagnosis/:patientId/:diagnosisId",
	isAuth,
	cachePDF(
		(req) => `pdf:one:${req.params.patientId}:${req.params.diagnosisId}`
	),
	printSpecificDiagnosis
);

export default router;
