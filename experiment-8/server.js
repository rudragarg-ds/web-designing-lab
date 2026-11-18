const express = require("express");
const { randomUUID } = require("node:crypto");
const { readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, "data", "books.json");

let books = [];

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function asyncHandler(handler) {
    return (request, response, next) => {
        Promise.resolve(handler(request, response, next)).catch(next);
    };
}

function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

function normalizeBook(input, existing = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw validationError("Send the book details as a JSON object.");
    }

    const title = input.title === undefined ? existing.title : input.title;
    const author = input.author === undefined ? existing.author : input.author;
    const genre = input.genre === undefined ? (existing.genre || "") : input.genre;
    let year = input.year === undefined ? (existing.year ?? null) : input.year;

    if (typeof title !== "string" || !title.trim()) {
        throw validationError("The title field is required.");
    }
    if (typeof author !== "string" || !author.trim()) {
        throw validationError("The author field is required.");
    }
    if (typeof genre !== "string") {
        throw validationError("The genre field must be text.");
    }
    if (year !== null) {
        if (typeof year === "string" && year.trim() !== "") year = Number(year);
        if (!Number.isInteger(year) || year < 1) {
            throw validationError("The year must be a positive whole number.");
        }
    }

    return {
        title: title.trim(),
        author: author.trim(),
        year,
        genre: genre.trim()
    };
}

async function saveBooks() {
    await writeFile(DATA_FILE, JSON.stringify(books, null, 2) + "\n", "utf8");
}

async function loadBooks() {
    try {
        const saved = await readFile(DATA_FILE, "utf8");
        const parsed = JSON.parse(saved);
        books = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        if (error.code === "ENOENT") {
            books = [];
            await saveBooks();
            return;
        }
        throw error;
    }
}

app.get("/api", (request, response) => {
    response.json({
        name: "Book Collection API",
        version: "1.0.0",
        interface: "/",
        endpoints: {
            list: "GET /api/books",
            get: "GET /api/books/:id",
            create: "POST /api/books",
            replace: "PUT /api/books/:id",
            update: "PATCH /api/books/:id",
            delete: "DELETE /api/books/:id"
        }
    });
});

app.get("/api/books", (request, response) => {
    response.json(books);
});

app.get("/api/books/:id", (request, response) => {
    const book = books.find((item) => item.id === request.params.id);
    if (!book) {
        return response.status(404).json({ error: "Book not found." });
    }
    response.json(book);
});

app.post("/api/books", asyncHandler(async (request, response) => {
    const details = normalizeBook(request.body);
    const now = new Date().toISOString();
    const book = {
        id: randomUUID(),
        ...details,
        createdAt: now,
        updatedAt: now
    };

    books.unshift(book);
    await saveBooks();
    response
        .status(201)
        .location("/api/books/" + book.id)
        .json(book);
}));

app.put("/api/books/:id", asyncHandler(async (request, response) => {
    const index = books.findIndex((item) => item.id === request.params.id);
    if (index === -1) {
        return response.status(404).json({ error: "Book not found." });
    }

    const details = normalizeBook(request.body);
    const updatedBook = {
        ...books[index],
        ...details,
        updatedAt: new Date().toISOString()
    };

    books[index] = updatedBook;
    await saveBooks();
    response.json(updatedBook);
}));

app.patch("/api/books/:id", asyncHandler(async (request, response) => {
    const index = books.findIndex((item) => item.id === request.params.id);
    if (index === -1) {
        return response.status(404).json({ error: "Book not found." });
    }

    const details = normalizeBook(request.body, books[index]);
    const updatedBook = {
        ...books[index],
        ...details,
        updatedAt: new Date().toISOString()
    };

    books[index] = updatedBook;
    await saveBooks();
    response.json(updatedBook);
}));

app.delete("/api/books/:id", asyncHandler(async (request, response) => {
    const index = books.findIndex((item) => item.id === request.params.id);
    if (index === -1) {
        return response.status(404).json({ error: "Book not found." });
    }

    books.splice(index, 1);
    await saveBooks();
    response.status(204).end();
}));

app.use((request, response) => {
    response.status(404).json({ error: "Route not found." });
});

app.use((error, request, response, next) => {
    if (response.headersSent) return next(error);

    if (error.type === "entity.parse.failed") {
        return response.status(400).json({ error: "Request body must contain valid JSON." });
    }

    const status = error.status || 500;
    const message = status < 500 ? error.message : "An unexpected server error occurred.";
    response.status(status).json({ error: message });
});

async function startServer() {
    await loadBooks();
    app.listen(PORT, () => {
        console.log("Book Collection API is running at http://localhost:" + PORT);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Could not start the Book Collection API:", error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, loadBooks, startServer };
