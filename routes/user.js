import express from "express";
import * as userController from "../controllers/user.js"; // Use import instead of require
import authenticateJWT from "../middlewares/auth.js";
const router = express.Router();

// Define your route
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/", authenticateJWT, userController.index);
router.get("/one", authenticateJWT, userController.show);
router.get("/doctors", userController.DoctorNames);
router.patch("/", authenticateJWT, userController.update);

// Use export default for the router
export default router;
