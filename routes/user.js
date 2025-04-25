import express from "express";
import * as userController from "../controllers/user.js"; // Use import instead of require
import authenticateJWT from "../middlewares/auth.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Define your route
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/", authenticateJWT, userController.index);
router.get("/one", authenticateJWT, userController.show);
router.get("/doctors", userController.DoctorNames);
router.patch(
	"/",
	upload.single("image"),
	authenticateJWT,
	userController.update
);
router.delete("/:id", authenticateJWT, userController.destroy);

// Use export default for the router
export default router;
