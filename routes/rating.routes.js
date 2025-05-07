import express from "express";
import { store } from "../controllers/rating.controller.js";
import authenticateJWT from "../middlewares/auth.js";

const router = express.Router();

// Define your route
router.post("/", authenticateJWT, store);

export default router;
