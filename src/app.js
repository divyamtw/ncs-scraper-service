import "dotenv/config";
import express from "express";
import scraperRoutes from "./routes/scraper.routes.js";
import songRoutes from "./routes/song.routes.js";
import rateLimit from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, chill bro 😄",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.use(express.json());

app.get("/", (req, res) => res.send("Hello, Dev!"));

app.use("/scraper", scraperRoutes);
app.use("/api", songRoutes);

export default app;
