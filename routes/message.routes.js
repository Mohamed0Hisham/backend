import express from "express";
import { index, store } from "../controllers/message.js";
import authintication from "../middlewares/auth.js";
import cacheForUser from "../middlewares/cacheForUser.js";
const router = express.Router();
router.post("/", authintication, store);
router.get("/:conversationId", authintication, cacheForUser(600), index);
export default router;
