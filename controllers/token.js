import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (user) => {
	const token = jwt.sign(
		{ _id: user._id, name: user.name, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: "15h" }
	);
	return token;
};

export const generateAccessToken = (user) => {
	const accessToken = jwt.sign(
		{
			_id: user._id,
			name: user.name,
			role: user.role,
			city: user.city,
			country: user.country,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "15h" }
	);

	return accessToken;
};
export const generateRefreshToken = (user) => {
	const refreshToken = jwt.sign(
		{ _id: user._id },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "30d" }
	);

	return refreshToken;
};
export const verifyRefreshToken = (token) => {
	return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
