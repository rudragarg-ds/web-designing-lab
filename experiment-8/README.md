# Experiment 8: Book Collection REST API

A small book catalogue built with **Node.js**, **Express**, and a browser interface. The page at the root lets you add, view, edit, search, and remove books. Each action uses the REST API and saves the collection in `data/books.json`.

## Requirements

- Node.js 18 or newer
- npm

## Run the experiment

Open a terminal in this folder and run:

~~~sh
npm install
npm start
~~~

Keep the terminal running, then open **http://localhost:3000** in your browser. The Book Shelf page is the visual demonstration for the practical.

## Use the page

1. Add a book with its title and author. Year and genre are optional.
2. Search the shelf by title, author, or genre.
3. Select **Edit** to change a book, or **Remove** to delete it.
4. Refresh the page to confirm that changes were saved.

## REST API endpoints

| Method | Route | Action |
| --- | --- | --- |
| GET | `/api/books` | List all books |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Replace a book |
| PATCH | `/api/books/:id` | Update selected fields |
| DELETE | `/api/books/:id` | Delete a book |

Open **http://localhost:3000/api** for the API summary, or **http://localhost:3000/api/books** to see the collection as JSON. Those addresses display data for API clients; the visual page is at the root address.

## Example requests

List books:

~~~sh
curl http://localhost:3000/api/books
~~~

Add a book:

~~~sh
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"The Hobbit","author":"J. R. R. Tolkien","year":1937,"genre":"Fantasy"}'
~~~

The create response includes the new book's `id`. Use that id in requests to read, update, or delete that book:

~~~sh
curl http://localhost:3000/api/books/BOOK_ID
~~~

~~~sh
curl -X PATCH http://localhost:3000/api/books/BOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"genre":"Fantasy"}'
~~~

~~~sh
curl -X DELETE http://localhost:3000/api/books/BOOK_ID
~~~

Each book has an id, title, author, year, genre, createdAt, and updatedAt. Title and author are required. The year, when provided, must be a positive whole number.
