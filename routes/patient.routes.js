import express from "express";
import isAuth from "../middlewares/auth.js";

import {
	deletePatient,
	fetchAllPatients,
	fetchPatient,
	registerPatient,
	updatePatient,
} from "../controllers/patient.controller.js";
import cacheForUser from "../middlewares/cacheForUser.js";

const router = express.Router();

router.get("/one/:id", isAuth, cacheForUser(600), fetchPatient);

router.get("/all", isAuth, cacheForUser(600), fetchAllPatients);

router.post("/", registerPatient);

router.put("/:id", isAuth, updatePatient);

router.delete("/:id", isAuth, deletePatient);
export default router;
