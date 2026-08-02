# The Reading Room — Library System (React + Express + MongoDB Atlas)

A small full-stack app for the Library System use case: search books, add
new titles, and borrow/return copies — all backed by your MongoDB Atlas
cluster.

## Folder structure

```
library-app/
├── backend/                  Express API server
│   ├── server.js              entry point
│   ├── lib/db.js               Atlas connection (shared/cached client)
│   ├── routes/books.js         insert, search, borrow, return, delete
│   └── .env.example            copy to .env and fill in your Atlas URI
└── frontend/                 React app (Vite)
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             UI: search, add form, book cards
        ├── App.css             styling
        └── api.js              fetch calls to the backend
```

## How the pieces talk to each other

```
React (browser)  --fetch-->  Express API  --mongodb driver-->  Atlas cluster
   (frontend)                  (backend)                        (your data)
```

The browser never touches MongoDB directly — it only calls your Express
API, which is the only place your Atlas username/password lives.

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and paste in your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority
MONGODB_DB=libraryDB
PORT=4000
```

Run it:
```bash
npm run dev
```
You should see `Library backend running at http://localhost:4000`.

Quick check it's alive:
```bash
curl http://localhost:4000/api/health
```

## 2. Frontend setup

In a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
Vite will print a local URL, typically `http://localhost:5173`. Open it in
your browser.

During local dev, any request the React app makes to `/api/...` is
automatically forwarded to the Express server on port 4000 (see
`vite.config.js`), so you don't need to worry about CORS locally.

## 3. Try it out

- Use **+ Add a book** to insert a new title (title, author, genre, copies).
- Use the **search bar** to filter by title/author text, genre, or
  availability — these map to `$regex`, `$or`, and exact-match filters on
  the backend.
- Click **Borrow** to decrement `copies` by 1 (`$inc`) and flip
  `available` to `false` once it hits zero (`$set`).
- Click **Return** to increment `copies` and mark it available again.
- Click **Remove** to delete a title entirely.

Every one of these actions is a real `insertOne`, `find`, or `updateOne`
call against your `libraryDB.books` collection in Atlas — you can confirm
it directly in `mongosh` or the Atlas UI's Data Explorer at any time.

## 4. Deploying

Because this is two separate services, they deploy separately:

**Backend (Express)** — needs a host that runs a long-lived Node process:
- Render, Railway, or Fly.io are the simplest options (free/cheap tiers)
- Set `MONGODB_URI` and `MONGODB_DB` as environment variables on that host
- Note the live URL it gives you, e.g. `https://library-api.onrender.com`

**Frontend (React/Vite)** — this part *can* go on Vercel:
- Push the `frontend/` folder to a GitHub repo
- Import it into Vercel as a Vite project (auto-detected)
- Before deploying, update `frontend/src/api.js` so `BASE` points at your
  live backend URL instead of the local `/api/books` proxy path, e.g.:
  ```js
  const BASE = "https://library-api.onrender.com/api/books";
  ```
- Also update the backend's CORS setup in `server.js` to allow your
  deployed frontend's origin instead of `*` by default.

## 5. Security note

Never commit `.env` — it's already in `.gitignore`. If a real connection
string is ever pasted somewhere it shouldn't be (a chat, a public repo),
rotate the database user's password in Atlas under **Database Access**
right away.
