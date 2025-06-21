import express from 'express';
import { like } from '../controllers/interaction.controller.js';
import authintication from "../middlewares/auth.js";
const router = express.Router();
router.post('/advice/:id/like',authintication, like);
export default router;