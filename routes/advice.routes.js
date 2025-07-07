import express from "express";
import {
	index,
	store,
	update,
	destroy,
} from "../controllers/advice.controller.js";
import authenticateJWT from "../middlewares/auth.js";
import cache from "../middlewares/cache.js";

const router = express.Router();

router.get("/", cache(600), index);
router.post("/", authenticateJWT, store);
router.patch("/:id", authenticateJWT, update);
router.delete("/:id", authenticateJWT, destroy);
export default router;
