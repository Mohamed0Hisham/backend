import express from "express";
import {
	callbackFromFacebook,
	callbackFromGoogle,
	confirmEmail,
	redirectToFacebook,
	redirectToGoogle,
} from "../controllers/oauth.controller.js";

const router = express.Router();

router.get("/email/confirm", confirmEmail)

router.get("/google", redirectToGoogle);

router.get("/google/callback", callbackFromGoogle);

router.get("/facebook", redirectToFacebook);

router.get("/facebook/callback", callbackFromFacebook);

export default router;
