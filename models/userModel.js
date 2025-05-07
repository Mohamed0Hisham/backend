import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Username is required"],
			maxLength: [50, "Username MUST NOT exceed 50 characters"],
		},
		gender: {
			type: String,
			required: [true, "Gender is required"],
			enum: ["Male", "Female"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: [true, "This email already exists"],
			minLength: [10, "Email size MUST be more than 10 characters"],
			maxLength: [150, "Email size MUST NOT exceed 150 characters"],
			trim: true,
			match: [
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				"Please enter a valid email address",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [8, "Password MUST be more than 8 characters"], // Regex
		},
		phone: {
			type: String,
			required: [true, "Phone number is required"],
			maxLength: [20, "Phone number MUST NOT exceed 20 characters"],
		},
		city: {
			type: String,
			required: [true, "City is required"],
			maxLength: [30, "City MUST NOT exceed 30 characters"],
		},
		country: {
			type: String,
			required: [true, "Country is required"],
			maxLength: [30, "Country MUST NOT exceed 30 characters"],
		},
		role: {
			type: String,
			required: [true, "Role is required"],
			enum: ["Admin", "Patient", "Doctor", "Nurse", "Hospital"],
			default: "Patient",
		},
		specialization: {
			type: String,
			maxLength: [40, "Specialization MUST NOT exceed 40 characters"],
		},
		appoints: [],
		otp: { type: String },
		otpExpiry: { type: Date },
		isVerified: { type: Boolean, default: false },
		ImgUrl: {
			type: String,
			default:
				"https://res.cloudinary.com/dweffiohi/image/upload/v1745583748/wn6wqxmsalbweclrngrn.jpg",
		},
		ImgPublicId: {
			type: String,
			default: process.env.USER_DEFAULT_IMAGE_PUBLICID,
		},
		rate: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
	},
	{
		timestamps: true,
	}
);
userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};
export default mongoose.model("User", userSchema);
