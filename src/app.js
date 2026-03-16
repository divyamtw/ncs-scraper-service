import "dotenv/config";
import express from "express";
import scraperRoutes from "./routes/scraper.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.send("Hello World!"));

app.use("/scraper", scraperRoutes);

export default app;
