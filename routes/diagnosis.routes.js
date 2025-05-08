import express from "express";
import isAuth from "../middlewares/auth.js";
import {
	addDiagnosis,
	deleteDiagnosis,
	fetchAllDiagnoses,
	fetchSpecificDiagnosis,
	updateDiagnosis,
} from "../controllers/diagnosis.controller.js";

const router = express.Router();

router.get("/:patientId/all", isAuth, fetchAllDiagnoses);

router.get("/:patientId/:diagnosisId", isAuth, fetchSpecificDiagnosis);

router.post("/", isAuth, addDiagnosis);

router.put("/:patientId/:diagnosisId", isAuth, updateDiagnosis);

router.delete("/:diagnosisId", isAuth, deleteDiagnosis);
export default router;
