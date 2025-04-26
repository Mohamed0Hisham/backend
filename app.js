import express from "express";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import cors from "cors";
import dotenv from "dotenv";
import rateLimter from "express-rate-limit";
import userRouter from "./routes/user.js";
import otpRouter from "./routes/otp.routes.js";
import appointmentRouter from "./routes/appointment.js";
import helmet from "helmet";
import adviceRouter from "./routes/advice.routes.js";
import diseasesCategoryRouter from "./routes/diseasesCategory.routes.js";
import diseasesRouter from "./routes/diseases.routes.js";
import treatmentRouter from "./routes/treatmnet.routes.js";
import advertisementtRouter from "./routes/advertisement.routes.js";
import ratingtRouter from "./routes/rating.routes.js";
import oauthRouter from "./routes/oauth.routes.js";
dotenv.config();

configDotenv();
// starting the server
const app = express();
// const Limter = rateLimter({
// 	windowMs: 1000 * 60 * 15,
// 	max: 20,
// 	message: "Too many requests ,try again later",
// });

// app.use(
// 	cors({
// 		origin: "https://localhost:",
// 		methods: [*],
// 		allowedHeaders: [*],
// 		credentials: true, // Allow cookies (if needed)
// 	})
// );
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
// app.use(Limter);

//APIs goes here
app.use("/api/users", userRouter);
app.use("/api/advices", adviceRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/diseasescategories", diseasesCategoryRouter);
app.use("/api/diseases", diseasesRouter);
app.use("/api/treatments", treatmentRouter);
app.use("/api/advertisements", advertisementtRouter);
app.use("/api/rate", ratingtRouter);
app.use("/auth", oauthRouter);
app.use("/api/otp", otpRouter);

app.get("*", (req, res) => {
	return res.status(404).json({
		Message: "Looks like You got lost",
	});
});

//Error handler route
app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";
	return res.status(statusCode).json({
		success: false,
		statusCode,
		message,
	});
});

mongoose
	.connect(process.env.DB_URL, {
		dbName: process.env.DB_NAME,
	})
	.then(() => {
		app.listen(process.env.PORT || 3000, () => {
			console.log("database is connected ✅");
			console.log("server is running ✅");
		});
	})
	.catch((error) => {
		console.log("Connection Failed" + " >>  " + error.message);
	});
