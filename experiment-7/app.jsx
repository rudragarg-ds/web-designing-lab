const { useEffect, useMemo, useState } = React;

const STORAGE_KEY = "experiment7-notes-v3";
const CATEGORIES = ["Study", "Work", "Personal", "Ideas"];

const SAMPLE_NOTES = [
    {
        id: "react-hooks",
        title: "React hooks",
        content: "useState keeps the note data and useEffect saves it to localStorage.",
        category: "Study",
        favorite: true,
        updatedAt: "2026-10-28T02:17:00"
    },
    {
        id: "data-analytics",
        title: "Data Analytics",
        content: "Revise Unit I and Unit II for the CIE.",
        category: "Study",
        favorite: false,
        updatedAt: "2026-10-28T02:17:00"
    },
    {
        id: "web-designing-lab",
        title: "Web Designing Lab",
        content: "Finish Experiment 7 and update the practical record PDF.",
        category: "Work",
        favorite: false,
        updatedAt: "2026-10-28T02:17:00"
    }
];

function loadNotes() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return SAMPLE_NOTES;
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : SAMPLE_NOTES;
    } catch (error) {
        return SAMPLE_NOTES;
    }
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

function NoteEditor({ note, onSave, onCancel }) {
    const [title, setTitle] = useState(note ? note.title : "");
    const [content, setContent] = useState(note ? note.content : "");
    const [category, setCategory] = useState(note ? note.category || "Personal" : "Personal");

    function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !content.trim()) return;
        onSave({ title: title.trim(), content: content.trim(), category });
    }

    return (
        <form className="editor" onSubmit={handleSubmit}>
            <div className="editor-heading">
                <h2>{note ? "Edit note" : "New note"}</h2>
                <button className="text-button" type="button" onClick={onCancel}>Cancel</button>
            </div>
            <div className="editor-fields">
                <label>
                    <span>Title</span>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Note title"
                        maxLength="100"
                        required
                    />
                </label>
                <label>
                    <span>Category</span>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                        {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                </label>
                <label className="content-field">
                    <span>Note</span>
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Write something to remember..."
                        rows="4"
                        required
                    ></textarea>
                </label>
            </div>
            <div className="editor-actions">
                <button className="button button-primary" type="submit">
                    {note ? "Save changes" : "Add note"}
                </button>
                <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

function NoteCard({ note, onEdit, onDelete, onToggleFavorite }) {
    return (
        <article className="note-card">
            <div className="card-heading">
                <span className="category-label">{note.category || "Personal"}</span>
                <button
                    className={"favorite-button" + (note.favorite ? " selected" : "")}
                    type="button"
                    onClick={() => onToggleFavorite(note.id)}
                    aria-label={note.favorite ? "Remove favorite" : "Add favorite"}
                    aria-pressed={Boolean(note.favorite)}
                >
                    {note.favorite ? "★" : "☆"}
                </button>
            </div>
            <h3>{note.title}</h3>
            <p className="note-text">{note.content}</p>
            <div className="card-bottom">
                <span className="date-label">Updated {formatDate(note.updatedAt)}</span>
                <div className="card-actions">
                    <button className="text-button" type="button" onClick={() => onEdit(note.id)}>Edit</button>
                    <button className="text-button delete-button" type="button" onClick={() => onDelete(note.id)}>Delete</button>
                </div>
            </div>
        </article>
    );
}

function App() {
    const [notes, setNotes] = useState(loadNotes);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All categories");
    const [sortBy, setSortBy] = useState("recent");
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            // Notes stay available for this session if browser storage is unavailable.
        }
    }, [notes]);

    const editingNote = notes.find((note) => note.id === editingId) || null;
    const favoriteCount = notes.filter((note) => note.favorite).length;

    const visibleNotes = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filtered = notes.filter((note) => {
            const matchesFavorite = !favoritesOnly || note.favorite;
            const matchesCategory = categoryFilter === "All categories" || note.category === categoryFilter;
            const matchesSearch = !query ||
                (note.title + " " + note.content + " " + (note.category || ""))
                    .toLowerCase()
                    .includes(query);
            return matchesFavorite && matchesCategory && matchesSearch;
        });

        return filtered.sort((a, b) => sortBy === "title"
            ? a.title.localeCompare(b.title)
            : new Date(b.updatedAt) - new Date(a.updatedAt)
        );
    }, [notes, search, categoryFilter, sortBy, favoritesOnly]);

    function closeEditor() {
        setIsCreating(false);
        setEditingId(null);
    }

    function saveNote(data) {
        const updatedAt = new Date().toISOString();
        if (editingNote) {
            setNotes((current) => current.map((note) =>
                note.id === editingNote.id ? { ...note, ...data, updatedAt } : note
            ));
        } else {
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
            setNotes((current) => [
                { id, ...data, favorite: false, updatedAt },
                ...current
            ]);
        }
        closeEditor();
    }

    function deleteNote(id) {
        if (!window.confirm("Delete this note?")) return;
        setNotes((current) => current.filter((note) => note.id !== id));
        if (editingId === id) closeEditor();
    }

    function toggleFavorite(id) {
        setNotes((current) => current.map((note) =>
            note.id === id ? { ...note, favorite: !note.favorite } : note
        ));
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <p className="course-label">WEB DESIGNING LAB · EXPERIMENT 07</p>
                    <h1>My Notes</h1>
                    <p className="subtitle">Keep study reminders and project ideas in one place.</p>
                </div>
                <button
                    className="button button-primary new-note-button"
                    type="button"
                    onClick={() => {
                        setEditingId(null);
                        setIsCreating(true);
                    }}
                >
                    + New note
                </button>
            </header>

            <main>
                <section className="toolbar" aria-label="Find and organize notes">
                    <label className="search-field">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search notes"
                            aria-label="Search notes"
                        />
                    </label>
                    <label className="select-field">
                        <span className="visually-hidden">Filter by category</span>
                        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                            <option>All categories</option>
                            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                        </select>
                    </label>
                    <label className="select-field sort-field">
                        <span className="visually-hidden">Sort notes</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                            <option value="recent">Recently updated</option>
                            <option value="title">Title A-Z</option>
                        </select>
                    </label>
                </section>

                <nav className="note-tabs" aria-label="Note views">
                    <button
                        className={!favoritesOnly ? "tab active" : "tab"}
                        type="button"
                        onClick={() => setFavoritesOnly(false)}
                    >
                        All notes <span>{notes.length}</span>
                    </button>
                    <button
                        className={favoritesOnly ? "tab active" : "tab"}
                        type="button"
                        onClick={() => setFavoritesOnly(true)}
                    >
                        Favorites <span>{favoriteCount}</span>
                    </button>
                </nav>

                {(isCreating || editingNote) && (
                    <NoteEditor
                        key={editingNote ? editingNote.id : "new"}
                        note={editingNote}
                        onSave={saveNote}
                        onCancel={closeEditor}
                    />
                )}

                <section className="notes-section" aria-labelledby="notes-heading">
                    <div className="section-heading">
                        <h2 id="notes-heading">{favoritesOnly ? "Favorite notes" : "Your notes"}</h2>
                        <span>{visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"}</span>
                    </div>

                    {visibleNotes.length ? (
                        <div className="notes-grid">
                            {visibleNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onEdit={(id) => {
                                        setIsCreating(false);
                                        setEditingId(id);
                                    }}
                                    onDelete={deleteNote}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3>{search ? "No matching notes" : "No notes here yet"}</h3>
                            <p>{search ? "Try a different search or change the filters." : "Add a note to get started."}</p>
                            {!search && (
                                <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setIsCreating(true);
                                    }}
                                >
                                    Create a note
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <footer className="page-footer">
                Changes are saved in this browser.
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
