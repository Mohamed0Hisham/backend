import express from "express";
import { index, store } from "../controllers/message.js";
import authintication from "../middlewares/auth.js";
const router = express.Router();
router.post("/", /**  authintication,*/ store);
router.get("/:conversationId", /**  authintication,*/ index);
export default router;
