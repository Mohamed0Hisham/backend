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
import cache from "../middlewares/cache.js";

router.get("/", cache(600), index);
router.get("/:id", cache(600), show);
router.post("/", authenticateJWT, store);
router.patch("/:id", authenticateJWT, update);
router.delete("/:id", authenticateJWT, destroy);

export default router;
