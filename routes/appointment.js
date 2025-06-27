import express from "express";
import {
	index,
	show,
	store,
	update,
	deleteAppointDoctor,
	deleteAppointUser,
} from "../controllers/appointmentController.js";
import authintication from "../middlewares/auth.js";
import cache from "../middlewares/cache.js";

const router = express.Router();

router.get("/", authintication, cache(600), index);
router.get("/:id", authintication, cache(600), show);
router.post("/doctor/:id", authintication, store);
router.patch("/:id", authintication, update);
router.delete("/user/:id", authintication, deleteAppointUser);
router.delete("/doctor/:id", authintication, deleteAppointDoctor);

export default router;
