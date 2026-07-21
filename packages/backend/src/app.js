const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const isTestEnv = process.env.NODE_ENV === 'test';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
if (!isTestEnv) {
  app.use(morgan('dev'));
}

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const isValidDueDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const toHumanReadable = (dateTimeValue) => {
  return new Date(dateTimeValue).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const serializeTodo = (row) => {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    createdAtHuman: toHumanReadable(row.created_at),
    updatedAt: row.updated_at,
  };
};

// Insert some initial data
const initialTodos = ['Plan sprint tasks', 'Refactor API handlers', 'Write E2E smoke test'];
const insertStmt = db.prepare(
  `INSERT INTO todos (title, due_date, completed, created_at, updated_at)
   VALUES (?, ?, ?, datetime('now'), datetime('now'))`
);

initialTodos.forEach((todoTitle) => {
  insertStmt.run(todoTitle, null, 0);
});

if (!isTestEnv) {
  console.log('In-memory database initialized with sample data');
}

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/todos', (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt';
    const order = (req.query.order || 'desc').toLowerCase();
    const orderSql = order === 'asc' ? 'ASC' : 'DESC';
    const sortMap = {
      createdAt: 'created_at',
      dueDate: 'due_date',
      title: 'title',
      completed: 'completed',
    };
    const sortColumn = sortMap[sortBy] || 'created_at';

    const todos = db
      .prepare(`SELECT * FROM todos ORDER BY ${sortColumn} ${orderSql}, id DESC`)
      .all()
      .map(serializeTodo);

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title, dueDate = null } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Todo title is required' });
    }

    if (!isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be YYYY-MM-DD or null' });
    }

    const result = insertStmt.run(title.trim(), dueDate || null, 0);
    const id = result.lastInsertRowid;

    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.status(201).json(serializeTodo(newTodo));
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate, completed } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Todo title cannot be empty' });
    }

    if (dueDate !== undefined && !isValidDueDate(dueDate)) {
      return res.status(400).json({ error: 'Due date must be YYYY-MM-DD or null' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }

    const nextTitle = title === undefined ? existingTodo.title : title.trim();
    const nextDueDate = dueDate === undefined ? existingTodo.due_date : (dueDate || null);
    const nextCompleted = completed === undefined ? existingTodo.completed : (completed ? 1 : 0);

    db.prepare(
      `UPDATE todos
       SET title = ?, due_date = ?, completed = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(nextTitle, nextDueDate, nextCompleted, id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(serializeTodo(updatedTodo));
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const completed = req.body && req.body.completed;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const nextCompleted = completed === undefined ? 1 : (completed ? 1 : 0);

    db.prepare(
      `UPDATE todos
       SET completed = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(nextCompleted, id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(serializeTodo(updatedTodo));
  } catch (error) {
    console.error('Error updating completion status:', error);
    res.status(500).json({ error: 'Failed to update completion status' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Backward-compatible aliases used by early bootcamp code.
app.get('/api/items', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM todos ORDER BY created_at DESC, id DESC').all();
    const legacyItems = rows.map((row) => ({
      id: row.id,
      name: row.title,
      created_at: row.created_at,
    }));
    res.json(legacyItems);
  } catch (error) {
    console.error('Error fetching legacy items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const name = req.body && req.body.name;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const result = insertStmt.run(name.trim(), null, 0);
    const newRow = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      id: newRow.id,
      name: newRow.title,
      created_at: newRow.created_at,
    });
  } catch (error) {
    console.error('Error creating legacy item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    res.json({ message: 'Item deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting legacy item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt, isValidDueDate, toHumanReadable, serializeTodo };