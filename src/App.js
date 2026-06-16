import { useState, useEffect } from "react";
import "./App.css";

//const API = "http://localhost:8000/todos";
//const API = "todo-app-production-8a5b.up.railway.app";
const API = "https://todo-app-production-8a5b.up.railway.app/todos";
export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { fetchTodos(); }, []);

  async function fetchTodos() {
    const res = await fetch(API);
    const data = await res.json();
    setTodos(data);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function addTodo() {
    if (!title.trim()) return showToast("Please enter a title!");
    await fetch(API + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    setTitle("");
    setDescription("");
    showToast("Task added ✓");
    fetchTodos();
  }

  async function toggleTodo(id, completed) {
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    showToast(completed ? "Task completed 🎉" : "Marked as pending");
    fetchTodos();
  }

  async function deleteTodo(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    showToast("Task deleted");
    fetchTodos();
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return showToast("Title cannot be empty!");
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDesc }),
    });
    setEditId(null);
    showToast("Task updated ✓");
    fetchTodos();
  }

  async function suggestDescription() {
    if (!title.trim()) return showToast("Type a title first!");
    setSuggesting(true);
    try {
      const res = await fetch(`${API}/ai/suggest?title=${encodeURIComponent(title)}`);
      const data = await res.json();
      setDescription(data.suggestion);
      showToast("AI suggestion ready ✦");
    } catch {
      showToast("AI suggestion failed");
    } finally {
      setSuggesting(false);
    }
  }

  const filtered = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.completed : !t.completed
  );

  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const pending = total - done;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="app">

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div className="logo">Task<span className="logo-accent">Flow</span></div>
          <div className="badge">✦ AI POWERED</div>
        </div>
        <div className="subtitle">Stay focused. Ship faster.</div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="stat-value accent">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat">
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat">
          <div className="stat-value green">{done}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-wrap">
        <div className="progress-bar" style={{ width: progress + "%" }} />
      </div>

      {/* Input card */}
      <div className="input-card">
        <div className="input-label">New Task</div>
        <div className="title-row">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
          />
          <button className="btn-ai" onClick={suggestDescription} disabled={suggesting}>
            {suggesting ? "⏳" : "✦ AI"}
          </button>
        </div>
        <textarea
          placeholder="Add a description..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button className="btn-primary" onClick={addTodo}>+ Add Task</button>
      </div>

      {/* Filter tabs */}
      <div className="section-header">
        <div className="section-title">Tasks</div>
        <div className="filter-tabs">
          {["all", "pending", "done"].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Todo list */}
      <div className="todo-list">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{filter === "done" ? "🎉" : "✦"}</div>
            <div className="empty-title">{filter === "done" ? "Nothing done yet" : "All clear!"}</div>
            <div className="empty-sub">{filter === "done" ? "Complete a task to see it here" : "Add a task above to get started"}</div>
          </div>
        ) : (
          filtered.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? "completed" : ""}`}>

              <input
                type="checkbox"
                checked={todo.completed}
                onChange={e => toggleTodo(todo.id, e.target.checked)}
              />

              <div className="todo-content">
                {editId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                    />
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                    />
                    <div className="edit-actions">
                      <button className="btn-save" onClick={() => saveEdit(todo.id)}>Save</button>
                      <button className="btn-cancel" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`todo-title ${todo.completed ? "done" : ""}`}>{todo.title}</div>
                    {todo.description && <div className="todo-desc">{todo.description}</div>}
                  </>
                )}
              </div>

              <div className="item-actions">
                <button
                  className="btn-icon edit"
                  onClick={() => { setEditId(todo.id); setEditTitle(todo.title); setEditDesc(todo.description || ""); }}
                >✎</button>
                <button className="btn-icon delete" onClick={() => deleteTodo(todo.id)}>✕</button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}