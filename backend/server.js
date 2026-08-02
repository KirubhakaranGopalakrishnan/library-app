import "dotenv/config";
import express from "express";
import cors from "cors";
import booksRouter from "./routes/books.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/books", booksRouter);

app.listen(PORT, () => {
  console.log(`Library backend running at http://localhost:${PORT}`);
});
