import express from "express";
import {
	index,
	store,
	update,
	destroy,
} from "../controllers/advice.controller.js";
import authenticateJWT from "../middlewares/auth.js";
import multer from "multer";
import cache from "../middlewares/cache.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/", cache(600), index);
router.post("/", upload.single("image"), authenticateJWT, store);
router.patch("/:id", upload.single("image"), authenticateJWT, update);
router.delete("/:id", authenticateJWT, destroy);
export default router;
