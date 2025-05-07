import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { addToBlacklist } from "./blacklist.js";
import { errorHandler } from "../helpers/errorHandler.js";
import emailService from "../Mail/emailService.js";
import { uploadImg, deleteImg } from "../helpers/images.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const register = async (req, res) => {
	try {
		const { email } = req.body;
		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: "This email already exists" });
		}

		const newUser = new userModel(req.body);
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		newUser.password = hashedPassword;

		const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		await emailService.confirmEmail(email, token);
		await newUser.save();

		res.status(201).json({ message: "confirmation email has been sent" });
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).json({
			message: "An error occurred while registering the user " + error,
		});
	}
};

export const login = async (req, res) => {
	try {
		const user = await userModel.findOne({ email: req.body.email });
		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		if (!user.isVerified) {
			return res
				.status(401)
				.json({ message: "unconfirmed email, check your email" });
		}

		const passwordCheck = await user.comparePassword(req.body.password);
		if (!passwordCheck) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		jwt.sign(
			{ _id: user._id, name: user.name, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "4h" },
			(error, token) => {
				if (error) {
					console.error("Error signing token:", error);
					return res.status(500).json({ message: "Internal server error" });
				}

				res.header("token", token, { httpOnly: true }).status(200).json({
					token,
				});
			}
		);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "An error occurred while logging in" });
	}
};
export const logout = async (req, res) => {
	try {
		const token = req.headers.authorization; // Get token from header
		if (!token) {
			return res.status(400).json({ message: "No token provided" });
		}

		addToBlacklist(token); // Now correctly calling the function

		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error during logout", error });
	}
};

export const index = async (req, res, next) => {
	try {
		if (req.user.role != "Admin") {
			res.status(403).json({
				message: "This Action is forbidden",
			});
		}
		const users = await userModel.find();
		if (users.length === 0) {
			return next(errorHandler(404, "There are no users "));
		}
		return res.status(200).json({
			data: users,
			msg: "There are some users ",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				`There is an error occured when retrieving the user data,Please try again later ${error}`
			)
		);
	}
};

export const show = async (req, res, next) => {
	try {
		const id = req.user._id;
		const user = await userModel.findById(id);
		if (!user) {
			return next(errorHandler(404, "Cannot find this user  "));
		}
		return res.status(200).json({
			data: user,
			msg: "The user data has been retrived",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"There is an error occured when retrived this user data,Please try again later " +
					error
			)
		);
	}
};

export const update = async (req, res, next) => {
	const id = req.user._id;
	try {
		const user = await userModel.findById(id);
		const result = { ...req.body }; // put all data wanted to be updated in one object because we have images and normal data form body

		// check whether there is an image or not
		if (req.file) {
			try {
				const image = await uploadImg(req.file);
				// check whether the user's image is the default or not, if not the default we delete it
				if (user.ImgPublicId != process.env.USER_DEFAULT_IMAGE_PUBLICID) {
					await deleteImg(user.ImgPublicId);
				}
				result.ImgPublicId = image.ImgPublicId;
				result.ImgUrl = image.ImgUrl;
			} catch (error) {
				return next(
					errorHandler(500, "Error while Upload or delete picture" + error)
				);
			}
		}
		const updatedUser = await userModel.findByIdAndUpdate(
			id,
			{ $set: result }, // Update only the fields provided in req.body
			{ new: true } // Return the updated document
		);
		return res.status(200).json({
			message: "User data has been updated",
			success: true,
			data: updatedUser,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while updating the Disease. Please try again later." +
					error
			)
		);
	}
};

export const DoctorNames = async (req, res, next) => {
	try {
		const doctorNames = await userModel
			.find(
				{ role: "Doctor" },
				{
					name: 1,
					phone: 1,
					city: 1,
					country: 1,
					ImgUrl: 1,
					specialization: 1,
					rate: 1,
					_id: 0,
				}
			)
			.lean();
		if (doctorNames.length === 0) {
			return next(errorHandler(404, "There are no doctors "));
		}
		return res.status(200).json({
			message: "Doctors' names are retrived sucessfully",
			success: true,
			data: doctorNames,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				500,
				"An error occurred while updating the Disease. Please try again later." +
					error
			)
		);
	}
};

export const destroy = async (req, res, next) => {
	const role = req.user.role;
	const UserId = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return next(errorHandler(400, "Invalid Advertisment ID"));
	}
	if (UserId == null) {
		return next(errorHandler(400, "All required fields must be provided."));
	}
	if (role != "Admin") {
		return next(errorHandler(403, "You are Unauthorized to do this action"));
	}
	try {
		const user = await userModel.findById(UserId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		await userModel.findOneAndDelete({ _id: UserId });
		return res.status(204).json({
			msg: "The User has been successfully deleted",
			success: true,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while deleting the User. Please try again later." +
					error
			)
		);
	}
};
