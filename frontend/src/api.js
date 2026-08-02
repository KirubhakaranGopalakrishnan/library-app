const BASE = "/api/books";

export async function fetchBooks({ q, genre, available } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre) params.set("genre", genre);
  if (available) params.set("available", available);

  const res = await fetch(`${BASE}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export async function addBook(book) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book)
  });
  if (!res.ok) throw new Error("Failed to add book");
  return res.json();
}

export async function borrowBook(id) {
  const res = await fetch(`${BASE}/${id}/borrow`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to borrow book");
  return res.json();
}

export async function returnBook(id) {
  const res = await fetch(`${BASE}/${id}/return`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to return book");
  return res.json();
}

export async function deleteBook(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete book");
  return res.json();
}
