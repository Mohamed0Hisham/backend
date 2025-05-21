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
			unique: [true, "This phone already exists"],
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
			enum: ["Admin", "Patient", "Doctor", "Nurse", "Hospital"],
			default: "Patient",
		},
		specialization: {
			type: String,
			maxLength: [40, "Specialization MUST NOT exceed 40 characters"],
		},
		Appointment: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "Appointment",
		},
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
			min: 1,
			max: 5,
		},
		emergencyContact: {
			name: { type: String },
			relationship: { type: String },
			phone: { type: String },
		},
		insuranceInfo: {
			provider: { type: String },
			policyNumber: { type: String },
			groupNumber: { type: String },
			expirationDate: { type: Date },
		},
		dateOfBirth: { 
			type: Date, 
			required: [true, "Date of birth is required"], 
			validate: {
				validator: function(value) {
					return value < new Date();
				},
				message: "Date of birth must be in the past",
			},
		},
		medicalHistory: {
			allergies: [String],
			chronicConditions: [String],
			surgeries: [
				{
					procedure: { type: String },
					date: { type: Date },
					notes: { type: String },
				},
			],
			familyHistory: { type: String },
		},
	},
	{
		timestamps: true,
	}
);
userSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.password);
};
const User = mongoose.model("User", userSchema);
export default User;
