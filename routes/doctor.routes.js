import express from "express";
import authenticateJWT from "../middlewares/auth.js";
import {
  destroy,
  show,
  store,
  update,
} from "../controllers/doctor.controller.js";
import cache from "../middlewares/cache.js";
const router = express.Router();

router.get("/", authenticateJWT, cache(600), show);

router.post("/", authenticateJWT, store);

router.put("/:id", authenticateJWT, update);

router.delete("/:id", authenticateJWT, destroy);

export default router;
