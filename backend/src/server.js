import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRouter from "./routes/events.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => res.send("✅ Backend is running"));

app.use('/api/events', eventRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
