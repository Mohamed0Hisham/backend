import express from "express";
import isAuth from "../middlewares/auth.js";
import {
	addDiagnosis,
	deleteDiagnosis,
	fetchAllDiagnoses,
	fetchSpecificDiagnosis,
	updateDiagnosis,
} from "../controllers/diagnosis.controller.js";
import cache from "../middlewares/cache.js";

const router = express.Router();

router.get("/:patientId/all", isAuth, cache(600), fetchAllDiagnoses);

router.get(
	"/:patientId/:diagnosisId",
	isAuth,
	cache(600),
	fetchSpecificDiagnosis
);

router.post("/", isAuth, addDiagnosis);

router.put("/:patientId/:diagnosisId", isAuth, updateDiagnosis);

router.delete("/:patientId/:diagnosisId", isAuth, deleteDiagnosis);
export default router;
