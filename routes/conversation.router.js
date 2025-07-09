import express from "express";
import { index, store } from "../controllers/conversation.js";
import authintication from "../middlewares/auth.js";
const router = express.Router();
router.post("/",/**  authintication,*/ store);
router.get("/:userId",/**  authintication,*/ index);
export default router;
