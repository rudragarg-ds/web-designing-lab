const form = document.querySelector("#book-form");
const list = document.querySelector("#book-list");
const search = document.querySelector("#search");
const total = document.querySelector("#book-total");
const visibleCount = document.querySelector("#visible-count");
const message = document.querySelector("#form-message");
const saveButton = document.querySelector("#save-button");
const saveLabel = document.querySelector("#save-label");
const cancelEdit = document.querySelector("#cancel-edit");
const connectionStatus = document.querySelector("#connection-status");
const connectionDot = document.querySelector("#connection-dot");

let books = [];
let editingId = null;

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

function setConnection(connected) {
  connectionStatus.textContent = connected ? "Connected" : "Server not reached";
  connectionDot.className = "connection-dot " + (connected ? "online" : "offline");
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function resetForm() {
  form.reset();
  editingId = null;
  saveLabel.textContent = "Add to shelf";
  cancelEdit.hidden = true;
  document.querySelector("#form-title").textContent = "Add a book";
  showMessage("");
}

function startEditing(book) {
  editingId = book.id;
  form.elements.title.value = book.title;
  form.elements.author.value = book.author;
  form.elements.year.value = book.year ?? "";
  form.elements.genre.value = book.genre || "";
  saveLabel.textContent = "Save changes";
  cancelEdit.hidden = false;
  document.querySelector("#form-title").textContent = "Edit this book";
  showMessage("Editing “" + book.title + "”.");
  document.querySelector("#title").focus();
}

function makeBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const icon = document.createElement("div");
  icon.className = "book-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "B";

  const info = document.createElement("div");
  info.className = "book-info";
  const title = document.createElement("h3");
  title.className = "book-title";
  title.textContent = book.title;
  const author = document.createElement("p");
  author.className = "book-author";
  author.textContent = "by " + book.author;
  const meta = document.createElement("div");
  meta.className = "book-meta";
  [book.year ? String(book.year) : "Year not set", book.genre || "Unclassified"].forEach((value) => {
    const tag = document.createElement("span");
    tag.textContent = value;
    meta.append(tag);
  });
  info.append(title, author, meta);

  const actions = document.createElement("div");
  actions.className = "book-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.textContent = "Edit";
  editButton.setAttribute("aria-label", "Edit " + book.title);
  editButton.addEventListener("click", () => startEditing(book));
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Remove";
  deleteButton.setAttribute("aria-label", "Remove " + book.title);
  deleteButton.addEventListener("click", () => deleteBook(book));
  actions.append(editButton, deleteButton);
  card.append(icon, info, actions);
  return card;
}

function renderBooks() {
  const query = search.value.trim().toLocaleLowerCase();
  const filtered = books.filter((book) =>
    [book.title, book.author, book.genre].some((value) =>
      String(value || "").toLocaleLowerCase().includes(query)
    )
  );

  total.textContent = String(books.length).padStart(2, "0");
  visibleCount.textContent = filtered.length + (filtered.length === 1 ? " title" : " titles");
  list.replaceChildren();

  if (books.length === 0) {
    const empty = document.createElement("p");
    empty.className = "list-state";
    empty.textContent = "Your shelf is empty. Add the first book using the form.";
    list.append(empty);
    return;
  }
  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "list-state";
    empty.textContent = "No books match that search. Try another title, author, or genre.";
    list.append(empty);
    return;
  }
  filtered.forEach((book) => list.append(makeBookCard(book)));
}

async function loadBooks() {
  list.innerHTML = '<p class="list-state">Loading your books…</p>';
  try {
    books = await request("/api/books");
    setConnection(true);
    renderBooks();
  } catch (error) {
    setConnection(false);
    list.replaceChildren();
    const errorState = document.createElement("p");
    errorState.className = "list-state";
    errorState.textContent = "Could not load your books. Check that the server is running, then refresh this page.";
    list.append(errorState);
    showMessage(error.message, true);
  }
}

async function deleteBook(book) {
  if (!window.confirm('Remove "' + book.title + '" from the collection?')) return;
  try {
    await request("/api/books/" + encodeURIComponent(book.id), { method: "DELETE" });
    if (editingId === book.id) resetForm();
    showMessage("Removed “" + book.title + "” from the shelf.");
    await loadBooks();
  } catch (error) {
    showMessage(error.message, true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    title: formData.get("title").trim(),
    author: formData.get("author").trim(),
    genre: formData.get("genre").trim()
  };
  const year = formData.get("year").trim();
  if (year) payload.year = Number(year);

  saveButton.disabled = true;
  showMessage(editingId ? "Saving your changes…" : "Adding the book…");
  try {
    const isEditing = Boolean(editingId);
    const path = isEditing ? "/api/books/" + encodeURIComponent(editingId) : "/api/books";
    await request(path, { method: isEditing ? "PATCH" : "POST", body: JSON.stringify(payload) });
    resetForm();
    showMessage(isEditing ? "Book updated successfully." : "Book added to your shelf.");
    await loadBooks();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
});

cancelEdit.addEventListener("click", resetForm);
search.addEventListener("input", renderBooks);
loadBooks();
