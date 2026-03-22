import express from "express";
import { getSongs } from "../controllers/song.controller.js";

const router = express.Router();

// GET /api/songs?page=2&limit=20
// GET /api/songs?isPopular=true&page=2&limit=5
router.get("/songs", getSongs);

export default router;
