# Experiment 8: Book Collection REST API

A Node.js and Express API for creating and managing a small book collection. Book data is stored in data/books.json, so it remains available after the server restarts.

## Requirements

- Node.js 18 or newer
- npm

## Run the API

From this folder, install the dependency and start the server:

~~~sh
npm install
npm start
~~~

The API runs at http://localhost:3000. Open that address to see the available routes. Sample books are included in data/books.json.

## Endpoints

| Method | Route | Action |
| --- | --- | --- |
| GET | /api/books | List all books |
| GET | /api/books/:id | Get one book |
| POST | /api/books | Add a book |
| PUT | /api/books/:id | Replace a book |
| PATCH | /api/books/:id | Update selected book fields |
| DELETE | /api/books/:id | Delete a book |

Each book contains an id, title, author, year, genre, createdAt, and updatedAt. Title and author are required. The year must be a positive whole number when provided.

## Try the API

List all books:

~~~sh
curl http://localhost:3000/api/books
~~~

Add a book:

~~~sh
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"The Hobbit","author":"J. R. R. Tolkien","year":1937,"genre":"Fantasy"}'
~~~

Use the id returned by the POST response to read, update, or delete that book:

~~~sh
curl http://localhost:3000/api/books/book-001
~~~

Replace a book:

~~~sh
curl -X PUT http://localhost:3000/api/books/book-001 \
  -H "Content-Type: application/json" \
  -d '{"title":"The Alchemist","author":"Paulo Coelho","year":1988,"genre":"Adventure"}'
~~~

Update only one field:

~~~sh
curl -X PATCH http://localhost:3000/api/books/book-001 \
  -H "Content-Type: application/json" \
  -d '{"genre":"Fiction"}'
~~~

Delete a book:

~~~sh
curl -X DELETE http://localhost:3000/api/books/book-001
~~~

The sample ids work for the included books until you delete or replace them. The API returns JSON errors for invalid input, unknown routes, and missing book ids.

## Note

This is a server-side Node.js project. GitHub Pages can host the repository's static experiment pages, but the Express API itself must run on a Node.js server or on your computer with npm start.
