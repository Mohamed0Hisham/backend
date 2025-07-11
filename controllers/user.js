import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { addToBlacklist } from "./blacklist.js";
import { errorHandler } from "../helpers/errorHandler.js";
import emailService from "../Mail/emailService.js";
import { uploadImg, deleteImg } from "../helpers/images.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../controllers/token.js";
import { format } from "date-fns";
import { invalidateCache } from "../helpers/invalidateCache.js";
dotenv.config();

export const register = async (req, res, next) => {
	try {
		const {
			name,
			gender,
			email,
			password,
			phone,
			city,
			country,
			dateOfBirth,
		} = req.body;

		const missingFields = [];

		if (!name) missingFields.push("name");
		if (!gender) missingFields.push("gender");
		if (!email) missingFields.push("email");
		if (!password) missingFields.push("password");
		if (!phone) missingFields.push("phone");
		if (!city) missingFields.push("city");
		if (!country) missingFields.push("country");
		if (!dateOfBirth) missingFields.push("dateOfBirth");

		if (missingFields.length > 0) {
			return next(
				errorHandler(
					400,
					`Missing required fields: ${missingFields.join(", ")}`
				)
			);
		}

		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			return res
				.status(409)
				.json({ message: "This email already exists" });
		}

		if (req.body.role) {
			return next(
				errorHandler(
					401,
					"Unauthorized operation, you can't set role for yourself"
				)
			);
		}

		const newUser = new userModel(req.body);
		if (req.file) {
			const image = await uploadImg(req.file);
			newUser.ImgPublicId = image.ImgPublicId;
			newUser.ImgUrl = image.ImgUrl;
		}
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		newUser.password = hashedPassword;

		const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		const user = await newUser.save();
		if (!user) {
			return res.status(500).json({ message: "User creation failed" });
		}

		await emailService.confirmEmail(email, token);
		await invalidateCache([
			"/api/users",
			"/api/users/hospitals",
			"/api/users/doctors",
			"/api/users/doctors/specialization",
		]);
		return res
			.status(201)
			.json({ message: "confirmation email has been sent" });
	} catch (error) {
		console.error(error.stack);
		return res.status(500).json({
			message:
				"An error occurred while registering the user " + error.message,
		});
	}
};

export const login = async (req, res) => {
	try {
		const user = await userModel.findOne({ email: req.body.email });
		if (!user) {
			return res
				.status(401)
				.json({ message: "Invalid email or password" });
		}

		if (!user.isVerified) {
			return res
				.status(401)
				.json({ message: "unconfirmed email, check your email" });
		}

		const passwordCheck = await user.comparePassword(req.body.password);
		if (!passwordCheck) {
			return res
				.status(401)
				.json({ message: "Invalid email or password" });
		}
		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		if (user.refreshTokens.length >= 3) {
			user.refreshTokens.shift();
		}

		user.refreshTokens.push(refreshToken);
		await user.save();

		/**if (!accessToken)
			return res
				.status(500)
				.json({ success: false, message: "failed to generate token" });*/

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",

			maxAge: 30 * 24 * 60 * 60 * 1000,
		});
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 15 * 60 * 60 * 1000,
		});

		return res.status(200).json({
			userId: user._id,
      Role: user.role,
			accessToken,
			refreshToken,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "An error occurred while logging in",
			errorStack: error.stack,
			errorMessage: error.message,
		});
	}
};
export const logout = async (req, res) => {
	try {
		const userId = req.user._id;
		const refreshToken = req?.cookies?.refreshToken;
		const accessToken = req?.cookies?.accessToken;

		const user = await userModel.findOne({ _id: userId });
		if (!user) return errorHandler(404, "user doesn't exist in database");

		user.refreshTokens = [];
		await user.save();

		// Clear cookies
		if (refreshToken)
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: true,
				sameSite: "None",
			});
		if (accessToken)
			res.clearCookie("accessToken", {
				httpOnly: true,
				secure: true,
				sameSite: "None",
			});
		return res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "Server error during logout", error });
	}
};
export const refresh = async (req, res) => {
	try {
		const { refreshToken } = req.cookies;
		if (!refreshToken) {
			return res
				.status(401)
				.json({ message: "No refresh token provided" });
		}
		const decodedToken = verifyRefreshToken(refreshToken);
		const user = await userModel.findById(decodedToken._id);

		if (!user || !user.refreshTokens.includes(refreshToken)) {
			return res.status(403).json({ message: "Invalid refresh token" });
		}

		const newAccessToken = generateAccessToken(user);

		res.cookie("accessToken", newAccessToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			maxAge: 15 * 60 * 60 * 1000,
		});
		return res.status(201).json({ refreshToken, newAccessToken });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "Server error during refreshing", error });
	}
};

export const index = async (req, res, next) => {
	try {
		// Check if the user is an Admin
		if (req.user.role !== "Admin") {
			return res.status(403).json({
				message: "This action is forbidden",
			});
		}

		// const page = parseInt(req.query.page) || 1;
		// const limit = parseInt(req.query.limit) || 10;
		// const skip = (page - 1) * limit;

		const users = await userModel.find().lean();

		if (users.length === 0) {
			return next(errorHandler(404, "There are no users")); // 404 Not Found for empty result
		}

		const totalUsers = await userModel.countDocuments();
		const totalAdmin = await userModel.countDocuments({ role: "Admin" });
		const totalDoctors = await userModel.countDocuments({ role: "Doctor" });
		const totalPatients = await userModel.countDocuments({
			role: "Patient",
		});
		const totalHospitals = await userModel.countDocuments({
			role: "Hospital",
		});
		const totalNurses = await userModel.countDocuments({ role: "Nurse" });

		// const totalPages = Math.ceil(totalUsers / limit);

		// Return the response including pagination info
		return res.status(200).json({
			success: true,
			msg: "There are some users",
			totalUsers: totalUsers,
			totalAdmin: totalAdmin,
			totalDoctors: totalDoctors,
			totalPatients: totalPatients,
			totalHospitals: totalHospitals,
			totalNurses: totalNurses,
			data: users,
			// totalPages: totalPages,
			// currentPage: page,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				`There was an error occurred when retrieving the user data. Please try again later: ${error}`
			)
		);
	}
};

export const show = async (req, res, next) => {
	try {
		const id = req.user._id;
		const role = req.user.role;
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

export const showOneUser = async (req, res, next) => {
	try {
		const role = req.user.role;
		const id = req.params.id;
		const user = await userModel.findById(id);
		if (role !== "Admin") {
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
				if (
					user.ImgPublicId != process.env.USER_DEFAULT_IMAGE_PUBLICID
				) {
					await deleteImg(user.ImgPublicId);
				}
				result.ImgPublicId = image.ImgPublicId;
				result.ImgUrl = image.ImgUrl;
			} catch (error) {
				return next(
					errorHandler(
						500,
						"Error while Upload or delete picture" + error
					)
				);
			}
		}
		const updatedUser = await userModel.findByIdAndUpdate(
			id,
			{ $set: result }, // Update only the fields provided in req.body
			{ new: true } // Return the updated document
		);

		await invalidateCache(["/api/users*", `${id}/api/users/one*`]);

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
		const page = parseInt(req.query.page) || 1;
		const limit = 10;
		const skip = (page - 1) * limit;
		const doctorNames = await userModel
			.aggregate([
				{ $match: { role: "Doctor" } },
				{
					$project: {
						name: 1,
						phone: 1,
						gender: 1,
						city: 1,
						country: 1,
						ImgUrl: 1,
						specialization: 1,
						rate: 1,
						Url: {
							$concat: [
								"http://localhost:5173/doctor/profile?name=",
								{
									$replaceAll: {
										input: "$name",
										find: " ",
										replacement: "-",
									},
								},
							],
						},
					},
				},
			])
			.skip(skip)
			.limit(limit);
		const totalDoctors = await userModel.countDocuments({ role: "Doctor" });

		const totalPages = Math.ceil(totalDoctors / limit);
		if (doctorNames.length === 0) {
			return next(errorHandler(404, "There are no doctors"));
		}

		return res.status(200).json({
			message: "Doctors' names are retrieved successfully",
			success: true,
			data: doctorNames,
			totalDoctors: totalDoctors,
			totalPages: totalPages,
			currentPage: page,
			limit: limit,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the doctors. Please try again later. " +
					error
			)
		);
	}
};

export const DoctorsBySpecialization = async (req, res, next) => {
	try {
		const doctorsBySpecialization = await userModel.aggregate([
			{ $match: { role: "Doctor" } },
			{
				$project: {
					name: 1,
					phone: 1,
					gender: 1,
					city: 1,
					country: 1,
					ImgUrl: 1,
					specialization: 1,
					rate: 1,
					Url: {
						$concat: [
							"http://localhost:5173/doctor/profile?name=",
							{
								$replaceAll: {
									input: "$name",
									find: " ",
									replacement: "-",
								},
							},
						],
					},
				},
			},
			{
				$group: {
					_id: "$specialization",
					doctors: { $push: "$$ROOT" },
				},
			},
			{
				$project: {
					_id: 0,
					specialization: "$_id",
					doctors: 1,
				},
			},
		]);

		if (!doctorsBySpecialization || doctorsBySpecialization.length === 0) {
			return next(errorHandler(404, "No doctors found"));
		}

		// Convert array to object { specialization: [doctors] }
		const groupedResult = {};
		doctorsBySpecialization.forEach((item) => {
			groupedResult[item.specialization] = item.doctors;
		});

		return res.status(200).json({
			message: "Doctors grouped by specialization",
			success: true,
			data: groupedResult,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"Failed to fetch doctors grouped by specialization. " +
					error.message
			)
		);
	}
};

export const HospitalNames = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = 10;
		const skip = (page - 1) * limit;

		const hospitalNames = await userModel
			.aggregate([
				{ $match: { role: "Hospital" } },
				{
					$project: {
						name: 1,
						phone: 1,
						city: 1,
						country: 1,
						ImgUrl: 1,
						rate: 1,
						dateOfBirth: 1,
						Url: {
							$concat: [
								"http://localhost:5173/hospital/profile?name=",
								{
									$replaceAll: {
										input: "$name",
										find: " ",
										replacement: "-",
									},
								},
							],
						},
					},
				},
			])
			.skip(skip)
			.limit(limit);

		const totalHospitals = await userModel.countDocuments({
			role: "Hospital",
		});
		const totalPages = Math.ceil(totalHospitals / limit);

		if (hospitalNames.length === 0) {
			return next(errorHandler(404, "There are no Hospitals"));
		}

		// Format hospital date fields
		const formattedHospitals = hospitalNames.map((hospital) => {
			const establishedDate = hospital.dateOfBirth
				? format(new Date(hospital.dateOfBirth), "dd-MM-yyyy")
				: null;

			return {
				name: hospital.name,
				phone: hospital.phone,
				city: hospital.city,
				country: hospital.country,
				ImgUrl: hospital.ImgUrl,
				rate: hospital.rate,
				Url: hospital.Url,
				Established: establishedDate,
			};
		});

		return res.status(200).json({
			message: "Hospital names are retrieved successfully",
			success: true,
			data: formattedHospitals,
			totalHospitals: totalHospitals,
			totalPages: totalPages,
			currentPage: page,
			limit: limit,
		});
	} catch (error) {
		return next(
			errorHandler(
				500,
				"An error occurred while retrieving the Hospitals. Please try again later. " +
					error
			)
		);
	}
};

export const showHospital = async (req, res, next) => {
	try {
		if (!req.query.name) {
			return res.redirect("/api/users/hospitals");
		}

		const HospitalName = req.query.name.replace(/-/g, " ");
		const hospital = await userModel
			.findOne(
				{
					role: "Hospital",
					name: HospitalName,
				},
				{
					name: 1,
					email: 1,
					phone: 1,
					city: 1,
					country: 1,
					rate: 1,
					ImgUrl: 1,
					dateOfBirth: 1, // or 'establishedDate' if applicable
				}
			)
			.lean();

		if (!hospital) {
			return next(errorHandler(404, "Hospital not found"));
		}

		const Established = hospital.dateOfBirth
			? format(new Date(hospital.dateOfBirth), "dd-MM-yyyy")
			: "N/A";

		const formatted = {
			name: hospital.name,
			email: hospital.email,
			phone: hospital.phone,
			city: hospital.city,
			country: hospital.country,
			EstablishedDate: Established,
			rate: hospital.rate,
			ImgUrl: hospital.ImgUrl,
		};

		return res.status(200).json({
			success: true,
			message: "Hospital profile fetched",
			hospital: formatted,
		});
	} catch (error) {
		return next(errorHandler(500, error.message));
	}
};

// export const destroy = async (req, res, next) => {
// 	const role = req.user.role;
// 	const UserId = req.params.id;
// 	if (!mongoose.Types.ObjectId.isValid(id)) {
// 		return next(errorHandler(400, "Invalid Advertisment ID"));
// 	}
// 	if (UserId == null) {
// 		return next(errorHandler(400, "All required fields must be provided."));
// 	}
// 	if (role != "Admin") {
// 		return next(errorHandler(403, "You are Unauthorized to do this action"));
// 	}
// 	try {
// 		const user = await userModel.findById(UserId);
// 		if (!user) {
// 			return res.status(404).json({ message: "User not found" });
// 		}
// 		await userModel.findOneAndDelete({ _id: UserId });
// 		return res.status(204).json({
// 			msg: "The User has been successfully deleted",
// 			success: true,
// 		});
// 	} catch (error) {
// 		return next(
// 			errorHandler(
// 				500,
// 				"An error occurred while deleting the User. Please try again later." +
// 					error
// 			)
// 		);
// 	}
// };
export const deleteAccount = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const refreshToken = req?.cookies?.refreshToken;
		const accessToken = req?.cookies?.accessToken;

		if (!userId) {
			return next(errorHandler(401, "Unauthenticated: please, login"));
		}

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return next(errorHandler(400, "Invalid User ID"));
		}

		const user = await userModel.findById(userId);
		if (!user) {
			return next(errorHandler(404, "User not found"));
		}

		// Delete user's profile image if it exists and is not the default image
		if (
			user.ImgPublicId &&
			user.ImgPublicId !== process.env.USER_DEFAULT_IMAGE_PUBLICID
		) {
			await deleteImg(user.ImgPublicId);
		}

		await userModel.deleteOne({ _id: userId });

		// Clear cookies
		if (refreshToken)
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: true,
				sameSite: "None",
			});
		if (accessToken)
			res.clearCookie("accessToken", {
				httpOnly: true,
				secure: true,
				sameSite: "None",
			});
		await invalidateCache(["/api/users*", `${userId}/api/users/one*`]);

		return res.status(200).json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error deleting account: " + error.message)
		);
	}
};

export const changeUserRole = async (req, res, next) => {
	const adminId = req.user._id;
	const targetUserId = req.params.userId;
	const { newRole } = req.body;

	try {
		// Check if the requester is an admin
		const admin = await userModel.findById(adminId);
		if (!admin || admin.role !== "Admin") {
			return next(
				errorHandler(403, "Only administrators can change user roles")
			);
		}

		// Validate the target user ID
		if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
			return next(errorHandler(400, "Invalid user ID"));
		}

		// Validate the new role
		const validRoles = ["Admin", "Patient", "Doctor", "Nurse", "Hospital"];
		if (!validRoles.includes(newRole)) {
			return next(errorHandler(400, "Invalid role."));
		}

		// Find and update the user
		const user = await userModel.findById(targetUserId);
		if (!user) {
			return next(errorHandler(404, "User not found"));
		}

		// Prevent changing the last admin's role
		if (user.role === "Admin" && newRole !== "Admin") {
			const adminCount = await userModel.countDocuments({
				role: "Admin",
			});
			if (adminCount <= 1) {
				return next(
					errorHandler(400, "Cannot change the last admin's role")
				);
			}
		}
		if (user.role === newRole) {
			return next(
				errorHandler(400, "Cannot change role to the same role")
			);
		}

		// Update the user's role
		user.role = newRole;
		await user.save();

		await invalidateCache(["/api/users*", `${adminId}/api/users/one/*`]);

		return res.status(200).json({
			success: true,
			message: "User role updated successfully",
		});
	} catch (error) {
		return next(
			errorHandler(500, "Error updating user role: " + error.message)
		);
	}
};
