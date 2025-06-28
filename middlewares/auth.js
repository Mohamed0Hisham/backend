import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
	const fullToken = req.headers.authorization;
	if (!fullToken) {
		return res.status(401).json({ message: "Access denied" });
	}

	const accessToken = fullToken.split(" ")[1];
	if (!accessToken) {
		return res.status(401).json({ message: "Access denied" });
	}

	try {
		const decoded = jwt.verify(
			accessToken,
			process.env.ACCESS_TOKEN_SECRET
		);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message:
				error.name === "TokenExpiredError"
					? "Token expired"
					: "Invalid token",
		});
	}
};

export default authenticateJWT;
