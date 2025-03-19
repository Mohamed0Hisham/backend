import User from "../models/userModel.js";
import { errorHandler } from "../helpers/errorHandler.js";
import { generateToken } from "../middlewares/auth.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { isTokenInBlacklist } from "./blacklist.js";
import { invalid } from "../Mail/templates/invalidConfirmation.template.js";
import { confirmed } from "../Mail/templates/confirmed.template.js";

export const redirectToGoogle = (req, res) => {
	const redirectUri = `${process.env.BASE_URL}/auth/google/callback`;
	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email`;
	res.redirect(authUrl);
};

export const callbackFromGoogle = async (req, res, next) => {
	const { code } = req.query;
	const redirectUri = `${process.env.BASE_URL}/auth/google/callback`;
	const tokenUrl = "https://oauth2.googleapis.com/token";

	try {
		const { data } = await axios.post(tokenUrl, {
			code,
			client_id: process.env.GOOGLE_CLIENT_ID,
			client_secret: process.env.GOOGLE_CLIENT_SECRET,
			redirect_uri: redirectUri,
			grant_type: "authorization_code",
		});

		const { access_token } = data;

		const userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
		const { data: userInfo } = await axios.get(userInfoUrl, {
			headers: { Authorization: `Bearer ${access_token}` },
		});

		const { email } = userInfo;
		const user = await User.findOne({ email }).lean();
		if (!user) {
			next(errorHandler(404, "the email doesn't exist in the database"));
		}

		const token = await generateToken(user);
		return res.redirect(`${process.env.CLIENT_URI}/home?token=${token}`);
	} catch (error) {
		console.error(
			"Google auth error:",
			error.response?.data || error.message
		);
		return next(errorHandler(500, error.message));
	}
};

export const redirectToFacebook = (req, res) => {
	const redirectUri = `${process.env.BASE_URL}/auth/facebook/callback`;
	const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email`;
	res.redirect(authUrl);
};

export const callbackFromFacebook = async (req, res, next) => {
	const { code } = req.query;
	const redirectUri = `${process.env.BASE_URL}/auth/facebook/callback`;
	const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${redirectUri}&code=${code}`;

	try {
		const { data } = await axios.get(tokenUrl);
		const { access_token } = data;

		const userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`;
		const { data: userInfo } = await axios.get(userInfoUrl);

		const { email } = userInfo;
		console.log(email);

		const user = await User.findOne({ email }).lean();
		if (!user) {
			next(errorHandler(404, "the email doesn't exist in the database"));
		}

		const token = await generateToken(user);
		return res.redirect(`${process.env.CLIENT_URI}/home?token=${token}`);
	} catch (error) {
		console.error(
			"Facebook auth error:",
			error.response?.data || error.message
		);
		return next(errorHandler(500, error.message));
	}
};

export const confirmEmail = async (req, res, next) => {
	try {
		const { email, token } = req.query;

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded);

		if (decoded.email !== email) {
			throw new Error()
		}

		if (isTokenInBlacklist(token)) {
			throw new Error()
		}

		await User.findOneAndUpdate({ email }, { isVerified: true });

		return res.status(200).send(confirmed());
	} catch (error) {
		return res.status(400).send(invalid());
	}
};
