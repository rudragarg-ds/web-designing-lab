const { useState, useEffect } = React;
const STORAGE_KEY = "experiment7-notes";

function loadNotes() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function formatDate() {
    return new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function NoteForm({ editingNote, onSave, onCancel }) {
    const [title, setTitle] = useState(editingNote ? editingNote.title : "");
    const [content, setContent] = useState(
        editingNote ? editingNote.content : ""
    );

    function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !content.trim()) return;

        onSave({
            title: title.trim(),
            content: content.trim()
        });
        setTitle("");
        setContent("");
    }

    return (
        <form className="note-form" onSubmit={handleSubmit}>
            <label htmlFor="note-title">Title</label>
            <input
                id="note-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Give your note a title"
                aria-label="Note title"
                required
            />

            <label htmlFor="note-content">Your note</label>
            <textarea
                id="note-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your thoughts here..."
                aria-label="Note content"
                rows="4"
                required
            ></textarea>

            <div className="form-buttons">
                <button className="primary-button" type="submit">
                    {editingNote ? "Update Note" : "Add Note"}
                </button>
                {editingNote && (
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

function NoteItem({ note, onEdit, onDelete }) {
    return (
        <li className="note-card">
            <div className="note-card-content">
                <h2>{note.title}</h2>
                <p>{note.content}</p>
                <small>Last updated: {note.updated}</small>
            </div>
            <div className="note-buttons">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onEdit(note.id)}
                    aria-label={"Edit note: " + note.title}
                >
                    Edit
                </button>
                <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDelete(note.id)}
                    aria-label={"Delete note: " + note.title}
                >
                    Delete
                </button>
            </div>
        </li>
    );
}

function App() {
    const [notes, setNotes] = useState(loadNotes);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            // Notes remain available in memory if browser storage is unavailable.
        }
    }, [notes]);

    const editingNote = notes.find((note) => note.id === editingId) || null;

    function saveNote(data) {
        if (editingNote) {
            setNotes((currentNotes) =>
                currentNotes.map((note) =>
                    note.id === editingNote.id
                        ? { ...note, ...data, updated: formatDate() }
                        : note
                )
            );
            setEditingId(null);
        } else {
            const newNote = {
                id: Date.now(),
                ...data,
                updated: formatDate()
            };
            setNotes((currentNotes) => [newNote, ...currentNotes]);
        }
    }

    function deleteNote(id) {
        if (!window.confirm("Delete this note?")) return;

        setNotes((currentNotes) =>
            currentNotes.filter((note) => note.id !== id)
        );

        if (editingId === id) setEditingId(null);
    }

    return (
        <main className="app-shell">
            <header className="app-header">
                <p className="eyebrow">YOUR PERSONAL SPACE</p>
                <h1>My Notes<span>.</span></h1>
                <p className="subtitle">
                    Capture ideas, keep track of thoughts, and come back to them anytime.
                </p>
            </header>

            <section className="composer-panel" aria-labelledby="composer-title">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">QUICK CAPTURE</p>
                        <h2 id="composer-title">
                            {editingNote ? "Edit your note" : "Create a note"}
                        </h2>
                    </div>
                </div>
                <NoteForm
                    key={editingNote ? editingNote.id : "new"}
                    editingNote={editingNote}
                    onSave={saveNote}
                    onCancel={() => setEditingId(null)}
                />
            </section>

            <section className="notes-section" aria-labelledby="notes-heading">
                <div className="notes-heading">
                    <div>
                        <p className="eyebrow">YOUR COLLECTION</p>
                        <h2 id="notes-heading">All notes</h2>
                    </div>
                    <p className="note-count" aria-live="polite">
                        <strong>{notes.length}</strong>
                        {notes.length === 1 ? " note" : " notes"}
                    </p>
                </div>

                {notes.length === 0 ? (
                    <div className="empty-state" role="status">
                        <div className="empty-icon" aria-hidden="true">✎</div>
                        <h3>Nothing here yet</h3>
                        <p>Add your first note above. It will appear here and stay saved in this browser.</p>
                    </div>
                ) : (
                    <ul className="note-list">
                        {notes.map((note) => (
                            <NoteItem
                                key={note.id}
                                note={note}
                                onEdit={setEditingId}
                                onDelete={deleteNote}
                            />
                        ))}
                    </ul>
                )}
            </section>

            <footer className="app-footer">
                Notes are saved locally in this browser using localStorage.
            </footer>
        </main>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
