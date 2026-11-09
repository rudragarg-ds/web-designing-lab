const { useEffect, useState } = React;

const STORAGE_KEY = "experiment7-notes-v2";
const SAMPLE_NOTES = [
    {
        id: "react-hooks",
        title: "React hooks",
        content: "useState keeps the note data and useEffect saves it to localStorage.",
        updated: "28 Oct 2026, 2:17 am"
    },
    {
        id: "data-analytics",
        title: "Data Analytics",
        content: "Revise Unit I and Unit II for the CIE.",
        updated: "28 Oct 2026, 2:17 am"
    },
    {
        id: "web-designing-lab",
        title: "Web Designing Lab",
        content: "Finish Experiment 7 and update the practical record PDF.",
        updated: "28 Oct 2026, 2:17 am"
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

function formatDate() {
    return new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function NoteForm({ editingNote, onSave, onCancel }) {
    const [title, setTitle] = useState(editingNote ? editingNote.title : "");
    const [content, setContent] = useState(editingNote ? editingNote.content : "");

    function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim() || !content.trim()) return;

        onSave({ title: title.trim(), content: content.trim() });
        setTitle("");
        setContent("");
    }

    return (
        <form className="note-form" onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Note title"
                aria-label="Note title"
                required
            />
            <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your note here..."
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
                        className="secondary-button"
                        type="button"
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
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <small>{note.updated}</small>
            <div className="note-buttons">
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onEdit(note.id)}
                    aria-label={`Edit note: ${note.title}`}
                >
                    Edit
                </button>
                <button
                    className="danger-button"
                    type="button"
                    onClick={() => onDelete(note.id)}
                    aria-label={`Delete note: ${note.title}`}
                >
                    Delete
                </button>
            </div>
        </li>
    );
}

function App() {
    const [notes, setNotes] = useState(loadNotes);
    const [editingId, setEditingId] = useState("data-analytics");

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            // Notes stay available until this page is closed if storage is unavailable.
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
            return;
        }

        setNotes((currentNotes) => [
            { id: Date.now(), ...data, updated: formatDate() },
            ...currentNotes
        ]);
    }

    function deleteNote(id) {
        if (!window.confirm("Delete this note?")) return;
        setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
        if (editingId === id) setEditingId(null);
    }

    return (
        <main className="app">
            <h1>My Notes</h1>
            <p className="note-count" aria-live="polite">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>

            <NoteForm
                key={editingNote ? editingNote.id : "new-note"}
                editingNote={editingNote}
                onSave={saveNote}
                onCancel={() => setEditingId(null)}
            />

            {notes.length === 0 ? (
                <p className="empty" role="status">
                    No notes yet. Add your first note above.
                </p>
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
        </main>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
