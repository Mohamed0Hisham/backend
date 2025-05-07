import express from "express";
import {
	index,
	show,
	store,
	update,
	destroy,
} from "../controllers/diseasesCategory.controller.js";
import authenticateJWT from "../middlewares/auth.js";
const router = express.Router();

router.get("/", authenticateJWT, index);
router.get("/:id", authenticateJWT, show);
router.post("/", authenticateJWT, store);
router.patch("/:id", authenticateJWT, update);
router.delete("/:id", authenticateJWT, destroy);

export default router;
