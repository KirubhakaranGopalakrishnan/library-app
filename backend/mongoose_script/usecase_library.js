
use("libraryDB");

// ---- 1. Setup ----
db.createCollection("books");

// ---- 2. Insert books ----
db.books.insertMany([
  { title: "Clean Code",          author: "Robert C. Martin", genre: "Programming", copies: 4, available: true  },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", genre: "Programming", copies: 2, available: true  },
  { title: "Atomic Habits",       author: "James Clear",      genre: "Self-help",   copies: 0, available: false },
  { title: "Sapiens",             author: "Yuval Noah Harari", genre: "History",    copies: 3, available: true  },
  { title: "1984",                author: "George Orwell",    genre: "Fiction",     copies: 1, available: true  },
  { title: "Deep Work",           author: "Cal Newport",      genre: "Self-help",   copies: 0, available: false }
]);

print("=== All books in the library ===");
db.books.find().forEach(doc => printjson(doc));

// ---- 3. Search operations ----

// Find all Self-help books
print("\n=== Self-help books ===");
db.books.find({ genre: "Self-help" }).forEach(doc => printjson(doc));

// Find all currently available books
print("\n=== Available books ===");
db.books.find({ available: true }).forEach(doc => printjson(doc));

// Find books with more than 1 copy in stock ($gt)
print("\n=== Books with more than 1 copy ($gt) ===");
db.books.find({ copies: { $gt: 1 } }).forEach(doc => printjson(doc));

// Find books that are either Fiction or History ($or)
print("\n=== Fiction or History books ($or) ===");
db.books.find({ $or: [{ genre: "Fiction" }, { genre: "History" }] })
  .forEach(doc => printjson(doc));

// ---- 4. Simulate a "borrow" transaction (update) ----
// A member borrows "1984": decrease copies by 1, and if
// copies hits 0, flip 'available' to false.
db.books.updateOne(
  { title: "1984" },
  { $inc: { copies: -1 } }
);
db.books.updateOne(
  { title: "1984", copies: { $lte: 0 } },
  { $set: { available: false } }
);

print("\n=== '1984' after a member borrows it ===");
printjson(db.books.findOne({ title: "1984" }));

// ---- 5. Simulate a "return" transaction (update) ----
// A member returns "Atomic Habits": increase copies, mark available.
db.books.updateOne(
  { title: "Atomic Habits" },
  { $inc: { copies: 1 }, $set: { available: true } }
);

print("\n=== 'Atomic Habits' after a return ===");
printjson(db.books.findOne({ title: "Atomic Habits" }));

// ---- 6. Restock multiple out-of-stock books at once (updateMany) ----
db.books.updateMany(
  { copies: 0 },
  { $set: { copies: 5, available: true } }
);

print("\n=== All books after restocking out-of-stock titles ===");
db.books.find().forEach(doc => printjson(doc));
