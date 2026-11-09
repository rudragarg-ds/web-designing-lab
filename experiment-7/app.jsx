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

function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function NoteEditor({ note, onSave, onCancel }) {
    const [title, setTitle] = useState(note ? note.title : "");
    const [content, setContent] = useState(note ? note.content : "");
    const [category, setCategory] = useState(note ? note.category : "Personal");

    function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !content.trim()) return;
        onSave({
            title: title.trim(),
            content: content.trim(),
            category
        });
    }

    return (
        <form className="editor-panel" onSubmit={handleSubmit}>
            <div className="editor-heading">
                <div>
                    <p className="eyebrow">{note ? "EDIT NOTE" : "QUICK CAPTURE"}</p>
                    <h2>{note ? "Make a thoughtful update" : "Create a new note"}</h2>
                </div>
                <button
                    className="icon-button close-editor"
                    type="button"
                    onClick={onCancel}
                    aria-label="Close editor"
                >
                    ×
                </button>
            </div>
            <label className="field-label" htmlFor="note-title">Title</label>
            <input
                id="note-title"
                className="text-field"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your note a clear title"
                maxLength="100"
                required
            />
            <div className="field-row">
                <label className="field-label" htmlFor="note-category">Category</label>
                <select
                    id="note-category"
                    className="text-field category-select"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                >
                    {CATEGORIES.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>
            <label className="field-label" htmlFor="note-content">Your note</label>
            <textarea
                id="note-content"
                className="text-field note-input"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write down the details you want to remember..."
                rows="5"
                required
            ></textarea>
            <div className="editor-actions">
                <button className="button button-primary" type="submit">
                    {note ? "Save changes" : "Add note"}
                </button>
                <button className="button button-quiet" type="button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

function NoteCard({ note, onEdit, onDelete, onToggleFavorite }) {
    return (
        <article className="note-card">
            <div className="note-card-top">
                <span className={"category-pill category-" + note.category.toLowerCase()}>
                    {note.category}
                </span>
                <button
                    className={"favorite-button" + (note.favorite ? " is-favorite" : "")}
                    type="button"
                    onClick={() => onToggleFavorite(note.id)}
                    aria-label={note.favorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={Boolean(note.favorite)}
                >
                    {note.favorite ? "★" : "☆"}
                </button>
            </div>
            <h2>{note.title}</h2>
            <p className="note-content">{note.content}</p>
            <div className="note-card-bottom">
                <span className="updated-date">Updated {formatDate(note.updatedAt)}</span>
                <div className="card-actions">
                    <button className="card-action" type="button" onClick={() => onEdit(note.id)}>
                        Edit
                    </button>
                    <button
                        className="card-action delete-action"
                        type="button"
                        onClick={() => onDelete(note.id)}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </article>
    );
}

function App() {
    const [notes, setNotes] = useState(loadNotes);
    const [activeView, setActiveView] = useState("all");
    const [activeCategory, setActiveCategory] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            // The notes remain usable for this session if storage is unavailable.
        }
    }, [notes]);

    const editingNote = notes.find((note) => note.id === editingId) || null;
    const favoriteCount = notes.filter((note) => note.favorite).length;

    const visibleNotes = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        const result = notes.filter((note) => {
            const matchesView = activeView !== "favorites" || note.favorite;
            const matchesCategory = !activeCategory || note.category === activeCategory;
            const matchesSearch = !normalizedSearch ||
                (note.title + " " + note.content + " " + note.category)
                    .toLowerCase()
                    .includes(normalizedSearch);
            return matchesView && matchesCategory && matchesSearch;
        });

        return result.sort((first, second) => {
            if (sortBy === "title") return first.title.localeCompare(second.title);
            return new Date(second.updatedAt) - new Date(first.updatedAt);
        });
    }, [notes, activeView, activeCategory, search, sortBy]);

    function openCreateForm() {
        setEditingId(null);
        setIsCreating(true);
    }

    function openEditForm(id) {
        setIsCreating(false);
        setEditingId(id);
    }

    function closeForm() {
        setIsCreating(false);
        setEditingId(null);
    }

    function saveNote(data) {
        const updatedAt = new Date().toISOString();
        if (editingNote) {
            setNotes((currentNotes) => currentNotes.map((note) =>
                note.id === editingNote.id ? { ...note, ...data, updatedAt } : note
            ));
        } else {
            setNotes((currentNotes) => [
                { id: makeId(), ...data, favorite: false, updatedAt },
                ...currentNotes
            ]);
        }
        closeForm();
    }

    function deleteNote(id) {
        if (!window.confirm("Delete this note? This cannot be undone.")) return;
        setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
        if (editingId === id) closeForm();
    }

    function toggleFavorite(id) {
        setNotes((currentNotes) => currentNotes.map((note) =>
            note.id === id ? { ...note, favorite: !note.favorite } : note
        ));
    }

    function showAllNotes() {
        setActiveView("all");
        setActiveCategory("");
    }

    function showFavorites() {
        setActiveView("favorites");
        setActiveCategory("");
    }

    return (
        <div className="workspace">
            <aside className="sidebar">
                <a className="brand" href="#" aria-label="Noted home" onClick={showAllNotes}>
                    <span className="brand-mark">n</span>
                    <span>noted<span className="brand-dot">.</span></span>
                </a>

                <button className="button button-primary create-button" type="button" onClick={openCreateForm}>
                    <span aria-hidden="true">＋</span> Create a note
                </button>

                <div className="sidebar-section">
                    <p className="sidebar-label">WORKSPACE</p>
                    <button
                        className={"nav-item" + (activeView === "all" && !activeCategory ? " active" : "")}
                        type="button"
                        onClick={showAllNotes}
                    >
                        <span className="nav-icon" aria-hidden="true">▤</span>
                        <span>All notes</span>
                        <span className="nav-count">{notes.length}</span>
                    </button>
                    <button
                        className={"nav-item" + (activeView === "favorites" ? " active" : "")}
                        type="button"
                        onClick={showFavorites}
                    >
                        <span className="nav-icon star-icon" aria-hidden="true">☆</span>
                        <span>Favorites</span>
                        <span className="nav-count">{favoriteCount}</span>
                    </button>
                </div>

                <div className="sidebar-section category-section">
                    <p className="sidebar-label">CATEGORIES</p>
                    {CATEGORIES.map((category) => (
                        <button
                            className={"nav-item category-nav" + (activeCategory === category ? " active" : "")}
                            key={category}
                            type="button"
                            onClick={() => {
                                setActiveView("all");
                                setActiveCategory(activeCategory === category ? "" : category);
                            }}
                        >
                            <span className={"category-dot category-dot-" + category.toLowerCase()}></span>
                            <span>{category}</span>
                            <span className="nav-count">
                                {notes.filter((note) => note.category === category).length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <span className="avatar">RG</span>
                    <span className="profile-copy">
                        <strong>Rudra Garg</strong>
                        <small>Personal workspace</small>
                    </span>
                    <span className="online-dot" aria-label="Saved locally"></span>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">WORKSPACE <span>/</span> NOTES</div>
                    <div className="save-status"><span></span> Saved in this browser</div>
                </header>

                <section className="page-heading">
                    <div>
                        <p className="eyebrow">YOUR PERSONAL SPACE</p>
                        <h1>{activeView === "favorites" ? "Favorite notes" : activeCategory || "My notes"}</h1>
                        <p className="page-description">
                            Keep your thoughts organized and find the right idea when you need it.
                        </p>
                    </div>
                    <button className="button button-primary heading-create" type="button" onClick={openCreateForm}>
                        <span aria-hidden="true">＋</span> New note
                    </button>
                </section>

                <section className="notes-toolbar" aria-label="Find and sort notes">
                    <label className="search-box">
                        <span className="search-icon" aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search your notes..."
                            aria-label="Search notes"
                        />
                        <span className="shortcut">⌘ K</span>
                    </label>
                    <label className="sort-control">
                        <span>Sort by</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort notes">
                            <option value="recent">Recently updated</option>
                            <option value="title">Title</option>
                        </select>
                    </label>
                </section>

                {(isCreating || editingNote) && (
                    <NoteEditor
                        key={editingNote ? editingNote.id : "create"}
                        note={editingNote}
                        onSave={saveNote}
                        onCancel={closeForm}
                    />
                )}

                <section className="notes-area" aria-labelledby="notes-title">
                    <div className="notes-area-heading">
                        <div>
                            <h2 id="notes-title">
                                {activeView === "favorites" ? "Your favorites" : activeCategory || "All notes"}
                            </h2>
                            <p>{visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"} in this view</p>
                        </div>
                    </div>

                    {visibleNotes.length > 0 ? (
                        <div className="note-grid">
                            {visibleNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onEdit={openEditForm}
                                    onDelete={deleteNote}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon" aria-hidden="true">⌕</span>
                            <h3>{search ? "No matching notes" : "Nothing here yet"}</h3>
                            <p>{search ? "Try another search term or clear your search." : "Create a note to start building your collection."}</p>
                            {!search && (
                                <button className="button button-primary" type="button" onClick={openCreateForm}>
                                    Create your first note
                                </button>
                            )}
                        </div>
                    )}
                </section>

                <footer className="main-footer">
                    <span>Noted keeps your ideas close.</span>
                    <span>Your notes are stored locally on this device.</span>
                </footer>
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
