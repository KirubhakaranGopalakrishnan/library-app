import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/db.js";

const router = Router();

// ---- SEARCH / LIST ----
// GET /api/books?q=atomic&genre=Self-help&available=true
router.get("/", async (req, res) => {
  try {
    const db = await getDb();
    const { q, genre, available } = req.query;

    const filter = {};

    // Text search across title/author using $or
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } }
      ];
    }

    if (genre) {
      filter.genre = genre;
    }

    if (available === "true") filter.available = true;
    if (available === "false") filter.available = false;

    const books = await db
      .collection("books")
      .find(filter)
      .sort({ title: 1 })
      .toArray();

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// ---- INSERT ----
// POST /api/books  { title, author, genre, copies }
router.post("/", async (req, res) => {
  try {
    const { title, author, genre, copies } = req.body;

    if (!title || !author || !genre) {
      return res.status(400).json({ error: "title, author, and genre are required" });
    }

    const db = await getDb();
    const doc = {
      title,
      author,
      genre,
      copies: Number(copies) || 0,
      available: Number(copies) > 0
    };

    const result = await db.collection("books").insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert book" });
  }
});

// ---- UPDATE: BORROW a copy ----
// PATCH /api/books/:id/borrow
router.patch("/:id/borrow", async (req, res) => {
  try {
    const db = await getDb();
    const _id = new ObjectId(req.params.id);

    const book = await db.collection("books").findOne({ _id });
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.copies <= 0) return res.status(400).json({ error: "No copies available" });

    const newCopies = book.copies - 1;
    await db.collection("books").updateOne(
      { _id },
      { $inc: { copies: -1 }, $set: { available: newCopies > 0 } }
    );

    const updated = await db.collection("books").findOne({ _id });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to borrow book" });
  }
});

// ---- UPDATE: RETURN a copy ----
// PATCH /api/books/:id/return
router.patch("/:id/return", async (req, res) => {
  try {
    const db = await getDb();
    const _id = new ObjectId(req.params.id);

    const book = await db.collection("books").findOne({ _id });
    if (!book) return res.status(404).json({ error: "Book not found" });

    await db.collection("books").updateOne(
      { _id },
      { $inc: { copies: 1 }, $set: { available: true } }
    );

    const updated = await db.collection("books").findOne({ _id });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to return book" });
  }
});

// ---- DELETE ----
// DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const _id = new ObjectId(req.params.id);
    const result = await db.collection("books").deleteOne({ _id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
