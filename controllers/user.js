import bcrypt from "bcrypt";
import userModel from "../models/userModel.js"; // Ensure the path and extension are correct
import jwt from "jsonwebtoken";
import { addToBlacklist } from "./blacklist.js";

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

		res.status(201).json({ message: "User  added successfully", user });
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).json({
			message: "An error occurred while registering the user",
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

/*export const login = async (req, res) => {
	try {
		const user = await userModel.findOne({ email: req.body.email });
		if (!user) {
			res.status(400).json({ message: "invalid email or password" });
		}
		const passwordCheck = await user.comparePassword(req.body.password);
		if (!passwordCheck) {
			res.status(400).json({ message: "invalid email or password" });
		}
		jwt.sign(
			{ _id: user._id, name: user.name, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }, // Set token expiration
			(error, token) => {
				if (error) {
					console.error("Error signing token:", error);
					return res.status(500).json({ message: "Internal server error" });
				}

				// Set the token in a cookie and respond
				res
					.cookie("token", token, { httpOnly: true }) // Set httpOnly for security
					.status(201)
					.json({
						_id: user._id,
						name: user.name, // Optionally return the user's name
					});
			}
		);
		res.status(200).json({ message: "user Logged in" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "An error occurred while logging in" });
	}
};*/
