import express from 'express';
import { like,dislike } from '../controllers/interaction.controller.js';
import authintication from "../middlewares/auth.js";
const router = express.Router();
router.post('/advice/:id/like',authintication, like);
router.post('/advice/:id/dislike',authintication, dislike);
export default router;