
import { useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div>
      <h1>My Notes App</h1>

      <input
        type="text"
        placeholder="Enter note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Enter note description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <h3>Preview</h3>
      <p>Title: {title}</p>
      <p>Description: {description}</p>
    </div>
  );
}

export default App;
