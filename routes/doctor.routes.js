import express from "express";
import authenticateJWT from "../middlewares/auth.js";
import {
	destroy,
	show,
	store,
	update,
} from "../controllers/doctor.controller.js";
const router = express.Router();

router.get("/", authenticateJWT, show);

router.post("/", store);

router.put("/", authenticateJWT, update);

router.delete("/", authenticateJWT, destroy);

export default router;
