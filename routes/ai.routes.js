import express from "express";
import {
  start_session,
  send_message,
  symptoms,
} from "../controllers/ai.controller.js";
import authintication from "../middlewares/auth.js";

const router = express.Router();
router.post("/start_session", authintication, start_session);
router.post("/send_message", authintication, send_message);
router.get("/symptoms", authintication, symptoms);

export default router;
