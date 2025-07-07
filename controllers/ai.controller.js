import axios from "axios";
import { errorHandler } from "../helpers/errorHandler.js";

export const start_session = async (req, res, next) => {
	try {
		const user = req.user;
		const { name, city, country } = user;

		const aiData = await axios.post(
			"https://ai-production-068e.up.railway.app/start_session",
			{ name, city, country }
		);
		res.status(200).json({
			success: true,
			data: aiData.data,
			userDetails: { name, city, country },
		});
	} catch (error) {
		return next(errorHandler(500, "failed to start session with Ai model"));
	}
};
export const send_message = async (req, res, next) => {
	try {
		const aiData = await axios.post(
			"https://ai-production-068e.up.railway.app/send_message",
			req.body
		);
		res.status(200).json({
			success: true,
			data: aiData.data,
		});
	} catch (error) {
		return next(
			errorHandler(500, "failed to send message to our Ai model")
		);
	}
};
export const symptoms = async (req, res) => {
	try {
		const aiData = await axios.get(
			"https://ai-production-068e.up.railway.app/symptoms"
		);
		res.status(200).json({
			success: true,
			data: aiData.data,
		});
	} catch (error) {
		return next(errorHandler(500, "failed to fetch symptoms"));
	}
};
