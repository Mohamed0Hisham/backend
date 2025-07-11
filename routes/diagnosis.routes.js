import express from "express";
import isAuth from "../middlewares/auth.js";
import {
  addDiagnosis,
  deleteDiagnosis,
  fetchAllDiagnoses,
  fetchSpecificDiagnosis,
  updateDiagnosis,
} from "../controllers/diagnosis.controller.js";
import cacheForUser from "../middlewares/cacheForUser.js";

const router = express.Router();

router.get("/:patientId/all", isAuth, cacheForUser(600), fetchAllDiagnoses);

router.get(
  "/:patientId/:diagnosisId",
  isAuth,
  cacheForUser(600),
  fetchSpecificDiagnosis
);


router.post("/", isAuth, addDiagnosis);
router.patch("/:patientId/:diagnosisId", isAuth, updateDiagnosis);
router.delete("/:patientId/:diagnosisId", isAuth, deleteDiagnosis);

export default router;
// router.put("/:patientId/:diagnosisId", isAuth, updateDiagnosis);
