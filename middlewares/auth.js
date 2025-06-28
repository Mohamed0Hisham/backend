import jwt from "jsonwebtoken";
//import { isTokenInBlacklist } from "../controllers/blacklist.js";

const authenticateJWT = (req, res, next) => {
	try {
		const fullToken = req.cookies.accessToken;
		// const fullToken = req.headers.authorization;
		if (!fullToken) {
			return res.status(401).json({ message: "Access denied" });
		}

		/**const accessToken = fullToken.split(" ")[1];
		if (!accessToken) {
			return res.status(403).json({ message: "Access denied" });
		}
	
		/**if (isTokenInBlacklist(token)) {
			return res
				.status(401)
				.json({ message: "Token is invalid, please log in again" });
		}*/

		jwt.verify(
			fullToken,
			process.env.ACCESS_TOKEN_SECRET,
			(err, decodedToken) => {
				if (err) {
					return res.status(401).json({ message: "Invalid token" });
				}
				req.user = decodedToken;
				next();
			}
		);
	} catch (error) {
		return res.status(500).json({
			message: "An error occurred while logging in",
			errorStack: error.stack,
			errorMessage: error.message,
		});
	}
};

export default authenticateJWT;
