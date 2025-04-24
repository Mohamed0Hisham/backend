import express from "express";
import {
	index,
	show,
	store,
	update,
	destroy,
} from "../controllers/advertisement.controller.js";
import authenticateJWT from "../middlewares/auth.js";
const router = express.Router();

router.get("/", index);
router.get("/:id", show);
router.post("/", authenticateJWT, store);
router.patch("/:id", authenticateJWT, update);
router.delete("/:id", authenticateJWT, destroy);
export default router;
