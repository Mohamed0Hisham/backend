import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import userModel from "../models/userModel.js";
import { compareOTP, generateOTP, hashOTP } from "../helpers/OTP.helpers.js";
import emailService from "../Mail/emailService.js";

dotenv.config();

export const sendOTP = async (req, res) => {
	const email = req.body?.email;
	if (email == null) {
		return res.status(400).json({
			success: false,
			message: "please provide an email",
			data: null,
		});
	}
	try {
		const user = await userModel.findOne({ email });
		if (user == null) {
			return res.status(404).json({
				success: false,
				message: "your email doesn't exist in the database",
				data: null,
			});
		}
		const OTP = generateOTP();
		const hashedOTP = await hashOTP(OTP);
		const OTPExpiry = new Date(Date.now() + 10 * 60000);

		await userModel.findOneAndUpdate(
			{ email },
			{ otp: hashedOTP, otpExpiry: OTPExpiry }
		);
		await emailService.sendOTPEmail(email, user.name, OTP);

		return res.status(201).json({
			success: true,
			message: "OTP has been sent",
			data: null,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({
			success: false,
			message: "internal server error",
			data: `${error}`,
		});
	}
};

export const verifyOTP = async (req, res) => {
	const { email, otp } = req.body;

	try {
		const user = await userModel.findOne({ email });
		if (!user || user.otpExpiry < Date.now()) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid or expired OTP" });
		}

		const isOTPValid = await compareOTP(otp, user.otp);
		if (isOTPValid == false) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid OTP" });
		}

		const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
			expiresIn: "10m",
		});

		/***
		 * I no longer need the OTP after the creation of the JWT token
		 * with The JWT token The user can procced the process with no proplems
		 */
		user.otp = undefined;
		user.otpExpiry = undefined;
		await user.save();

		return res.status(200).json({
			success: true,
			message: "OTP verified",
			data: resetToken,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "internal server error",
			data: `${error}`,
		});
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { resetToken, newPassword, confirmPassword } = req.body;
		if (newPassword !== confirmPassword) {
			return res
				.status(400)
				.json({ success: false, message: "Passwords do not match" });
		}

		const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
		const email = decoded.email;

		const user = await userModel.findOne({ email });
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
		user.password = hashedPassword;
		await user.save();

		return res
			.status(200)
			.json({ success: true, message: "Password updated" });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "internal server error",
			data: `${error}`,
		});
	}
};
