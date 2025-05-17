import jwt from "jsonwebtoken";
import { isTokenInBlacklist } from "../controllers/blacklist.js";

const authenticateJWT = (req, res, next) => {
	const fullToken = req.headers.authorization;
	if (!fullToken) {
		return res.status(403).json({ message: "Access denied" });
	}

	const token = fullToken.split(" ")[1];
	if (!token) {
		return res.status(403).json({ message: "Access denied" });
	}

	if (isTokenInBlacklist(token)) {
		return res
			.status(401)
			.json({ message: "Token is invalid, please log in again" });
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
		if (err) {
			return res.status(403).json({ message: "Invalid token" });
		}
		req.user = decodedToken;
		next();
	});
};

export const generateToken = (user) => {
	const token = jwt.sign(
		{ _id: user._id, name: user.name, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: "4h" }
	);
	return token;
};
export default authenticateJWT;
