import { useEffect, useMemo, useState } from "react";
import { fetchBooks, addBook, borrowBook, returnBook, deleteBook } from "./api.js";

const EMPTY_FORM = { title: "", author: "", genre: "", copies: 1 };

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [available, setAvailable] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchBooks({ q, genre, available });
      setBooks(data);
    } catch (err) {
      setError("Could not reach the library server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genres = useMemo(
    () => [...new Set(books.map((b) => b.genre))].sort(),
    [books]
  );

  async function handleSearchSubmit(e) {
    e.preventDefault();
    load();
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.author || !form.genre) return;
    await addBook({ ...form, copies: Number(form.copies) });
    setForm(EMPTY_FORM);
    setFormOpen(false);
    load();
  }

  async function handleBorrow(id) {
    await borrowBook(id);
    load();
  }

  async function handleReturn(id) {
    await returnBook(id);
    load();
  }

  async function handleDelete(id) {
    await deleteBook(id);
    load();
  }

  return (
    <div className="page">
      <header className="masthead">
        <p className="eyebrow">Library App</p>
        <h1>The Reading Room</h1>
        <p className="tagline">Search the shelves. Check a title out. Bring it back.</p>
      </header>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by title or author…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select value={available} onChange={(e) => setAvailable(e.target.value)}>
          <option value="">Any status</option>
          <option value="true">Available</option>
          <option value="false">Checked out</option>
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setFormOpen((o) => !o)}
        >
          {formOpen ? "Close" : "+ Add a book"}
        </button>
      </form>

      {formOpen && (
        <form className="add-form" onSubmit={handleAddSubmit}>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            required
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          <input
            required
            placeholder="Genre"
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Copies"
            value={form.copies}
            onChange={(e) => setForm({ ...form, copies: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">Catalog it</button>
        </form>
      )}

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="status-text">Pulling the shelves…</p>
      ) : books.length === 0 ? (
        <p className="status-text">No books match. Try a different search, or add one.</p>
      ) : (
        <div className="card-grid">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onBorrow={() => handleBorrow(book._id)}
              onReturn={() => handleReturn(book._id)}
              onDelete={() => handleDelete(book._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookCard({ book, onBorrow, onReturn, onDelete }) {
  const outOfStock = book.copies <= 0;

  return (
    <article className={`card ${outOfStock ? "card-out" : ""}`}>
      {outOfStock && <span className="stamp">OUT</span>}
      <p className="card-genre">{book.genre}</p>
      <h3 className="card-title">{book.title}</h3>
      <p className="card-author">by {book.author}</p>
      <p className="card-copies">{book.copies} {book.copies === 1 ? "copy" : "copies"} on the shelf</p>
      <div className="card-actions">
        <button
          className="btn btn-small btn-primary"
          onClick={onBorrow}
          disabled={outOfStock}
        >
          Borrow
        </button>
        <button className="btn btn-small btn-ghost" onClick={onReturn}>
          Return
        </button>
        <button className="btn btn-small btn-text" onClick={onDelete}>
          Remove
        </button>
      </div>
    </article>
  );
}
