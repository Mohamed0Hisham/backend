/**
 import express from "express";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import doctorRouter from "./routes/doctor.routes.js";
import messageRouter from "./routes/message.routes.js";
import conversationRouter from "./routes/conversation.router.js";
import pdfRouter from "./routes/pdf.routes.js";
import patientRouter from "./routes/patient.routes.js";
import diagnosisRouter from "./routes/diagnosis.routes.js";
import interactionRouter from "./routes/interacrion.route.js";
dotenv.config();

configDotenv();
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
app.use(
	cors({
		origin: (origin, callback) => {
			callback(null, origin || "*");
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

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
app.use("/api/doctor", doctorRouter);
app.use("/api/message", messageRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/file", pdfRouter);
app.use("/api/patient", patientRouter);
app.use("/api/diagnosis", diagnosisRouter);
app.use("/api", interactionRouter);

app.get("*", (req, res) => {
	return res.status(404).json({
		Message: "Looks like You got lost",
	});
});

//Error handler route

app.use((err, req, res, next) => {
	if (res.headersSent) {
		return;
	}

	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";
	return res.status(statusCode).json({
		success: false,
		code: statusCode,
		message,
	});
});

mongoose
	.connect(process.env.DB_URL, {
		dbName: process.env.DB_NAME,
	})
	.then(() => {
		app.listen(process.env.PORT || 8080, () => {
			console.log("database is connected ✅");
			console.log("server is running ✅");
		});
	})
	.catch((error) => {
		console.log("Connection Failed" + " >>  " + error.message);
	});
*/
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Routers
import userRouter from "./routes/user.js";
import otpRouter from "./routes/otp.routes.js";
import appointmentRouter from "./routes/appointment.js";
import adviceRouter from "./routes/advice.routes.js";
import diseasesCategoryRouter from "./routes/diseasesCategory.routes.js";
import diseasesRouter from "./routes/diseases.routes.js";
import treatmentRouter from "./routes/treatmnet.routes.js";
import advertisementtRouter from "./routes/advertisement.routes.js";
import ratingtRouter from "./routes/rating.routes.js";
import oauthRouter from "./routes/oauth.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import messageRouter from "./routes/message.routes.js";
import conversationRouter from "./routes/conversation.router.js";
import pdfRouter from "./routes/pdf.routes.js";
import patientRouter from "./routes/patient.routes.js";
import diagnosisRouter from "./routes/diagnosis.routes.js";
import interactionRouter from "./routes/interacrion.route.js";
import aiRouter from "./routes/ai.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app); 


const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin || "*");
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});



let users = [];

const addUser = (userId, socketId) => {
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
    console.log(`✅ User added: ${userId} with socket ID: ${socketId}`);
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log(`❌ User with socket ID: ${socketId} removed`);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log("🧠 All connected users:", users);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    console.log(receiverId)
    if (user) {
      io.to(user.socketId).emit("getMessage", { senderId, text });
      console.log(`📨 Message sent from ${senderId} to ${receiverId}: ${text}`);
    } else {
      console.log(`⚠️ User ${receiverId} not connected.`);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected:", socket.id);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

// ✅ Middlewares
app.use(
  cors({
     origin: (origin, callback) => {
      callback(null, origin || "*");
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// ✅ Routes
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
app.use("/api/doctor", doctorRouter);
app.use("/api/message", messageRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/file", pdfRouter);
app.use("/api/patient", patientRouter);
app.use("/api/diagnosis", diagnosisRouter);
app.use("/api/ai", aiRouter);
app.use("/api", interactionRouter);

app.get("*", (req, res) => {
  return res.status(404).json({ message: "Looks like you got lost" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return;
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, code: statusCode, message });
});
// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.DB_URL, { dbName: process.env.DB_NAME })
  .then(() => {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      console.log("✅ Database connected");
      console.log(`🚀 Server & Socket.IO running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ DB connection failed:", err.message);
  });

  