import express from "express";
import * as userController from "../controllers/user.js"; // Use import instead of require
import authenticateJWT from "../middlewares/auth.js";
import multer from "multer";
import cache from "../middlewares/cache.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Define your route
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/", authenticateJWT, cache(600), userController.index);
router.get("/one", authenticateJWT, cache(600), userController.show);
router.post("/refresh", userController.refresh);
router.get("/doctors", userController.DoctorNames);
// router.get("/hospitals", userController.HospitalNames);
// router.get("/hospital", userController.showHospital);
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
