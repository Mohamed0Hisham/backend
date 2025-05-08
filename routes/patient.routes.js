import express from "express";
import isAuth from "../middlewares/auth.js";

import {
	deletePatient,
	fetchAllPatients,
	fetchPatient,
	registerPatient,
	updatePatient,
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/one/:id", isAuth, fetchPatient);

router.get("/all", isAuth, fetchAllPatients);

router.post("/", registerPatient);

router.put("/:id", isAuth, updatePatient);

router.delete("/:id", isAuth, deletePatient);
export default router;
