import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "libraryDB";

if (!uri) {
  throw new Error("Missing MONGODB_URI in .env — copy .env.example to .env and fill it in.");
}

// A single shared client, reused across every request instead of
// opening a brand-new connection each time.
const client = new MongoClient(uri);
let connectPromise = null;

export async function getDb() {
  if (!connectPromise) {
    connectPromise = client.connect();
  }
  await connectPromise;
  return client.db(dbName);
}
