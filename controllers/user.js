import bcrypt from "bcrypt";
import userModel from "../models/userModel.js"; // Ensure the path and extension are correct
import jwt from "jsonwebtoken";
import { addToBlacklist } from "./blacklist.js";
import { errorHandler } from "../helpers/errorHandler.js";

export const register = async (req, res) => {
	try {
		const existingUser = await userModel.findOne({ email: req.body.email }); // Ensure you use req.body.email
		if (existingUser) {
			return res.status(409).json({ message: "This email already exists" }); // there is a conflict in existing data
		}

		const newUser = new userModel(req.body);
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		newUser.password = hashedPassword;

		// Save the user and wait for the result
		const user = await newUser.save(); // Make sure to await the save operation
		
		const token = jwt.sign({ email }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		await emailService.confirmEmail(email, token);

		res.status(201).json({ message: "User  added successfully", user });
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).json({
			message: "An error occurred while registering the user "+error,
		});
	}
};

export const login = async (req, res) => {
	try {
		const user = await userModel.findOne({ email: req.body.email });
		if (!user) {
			return res.status(401).json({ message: "Invalid email or password" }); // unauthorized not bad request
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
		const user = await userModel.findOneAndUpdate({ _id: id }, req.body, {
			new: true,
		});
		return res.status(200).json({
			message: "User data has been updated",
			success: true,
			data: user,
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


