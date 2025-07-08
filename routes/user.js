import express from "express";
import * as userController from "../controllers/user.js"; // Use import instead of require
import authenticateJWT from "../middlewares/auth.js";
import multer from "multer";
import cache from "../middlewares/cache.js";
import cacheForUser from "../middlewares/cacheForUser.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Define your route
router.post("/register", upload.single("image"), userController.register);
router.post("/login", userController.login);
router.post("/logout", authenticateJWT, userController.logout);
router.get("/", authenticateJWT, cache(600), userController.index);
router.get("/one", authenticateJWT, cacheForUser(600), userController.show);
router.get("/one/:id", authenticateJWT, cache(600), userController.showOneUser);
router.post("/refresh", userController.refresh);
router.get("/doctors", cache(600), userController.DoctorNames);
router.get("/hospitals", cache(600), userController.HospitalNames);
router.get("/hospital", cache(600), userController.showHospital);
router.get("/doctors/specialization", userController.DoctorsBySpecialization);
router.patch(
	"/",
	upload.single("image"),
	authenticateJWT,
	userController.update
);
// router.delete("/:id", authenticateJWT, userController.destroy);
router.delete("/", authenticateJWT, userController.deleteAccount);
router.patch("/role/:userId", authenticateJWT, userController.changeUserRole);

// Use export default for the router
export default router;
