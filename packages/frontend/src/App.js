import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#0f766e' },
    secondary: { main: '#f97316' },
    background: { default: '#f4f7f7', paper: '#ffffff' },
    success: { main: '#15803d' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
    h4: { fontWeight: 800 },
    h6: { fontWeight: 700 },
  },
});

const DEFAULT_SORT = { sortBy: 'createdAt', order: 'desc' };

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [sortBy, setSortBy] = useState(DEFAULT_SORT.sortBy);
  const [order, setOrder] = useState(DEFAULT_SORT.order);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [sortBy, order]);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/todos?sortBy=${sortBy}&order=${order}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTodos(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          dueDate: newDueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const result = await response.json();
      setTodos((current) => [result, ...current]);
      setNewTitle('');
      setNewDueDate('');
      setError(null);
    } catch (err) {
      setError('Error adding todo: ' + err.message);
      console.error('Error adding todo:', err);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((current) => current.filter((item) => item.id !== todoId));
      setError(null);
    } catch (err) {
      setError('Error deleting todo: ' + err.message);
      console.error('Error deleting todo:', err);
    }
  };

  const handleToggleCompleted = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedTodo = await response.json();
      setTodos((current) => current.map((row) => (row.id === updatedTodo.id ? updatedTodo : row)));
      setError(null);
    } catch (err) {
      setError('Error updating todo status: ' + err.message);
    }
  };

  const openEditDialog = (todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDueDate(todo.dueDate || '');
  };

  const closeEditDialog = () => {
    setEditingTodo(null);
    setEditTitle('');
    setEditDueDate('');
  };

  const handleSaveEdit = async () => {
    if (!editingTodo) {
      return;
    }

    if (!editTitle.trim()) {
      setError('Todo title cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          dueDate: editDueDate || null,
          completed: editingTodo.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos((current) => current.map((row) => (row.id === updatedTodo.id ? updatedTodo : row)));
      setError(null);
      closeEditDialog();
    } catch (err) {
      setError('Error updating todo: ' + err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="app-bg">
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Card className="hero-card" elevation={0}>
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  TaskFlow 2026
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your priorities with due dates, sorting, and completion tracking.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Chip label={`Total: ${todos.length}`} color="primary" variant="outlined" />
                  <Chip label={`Completed: ${completedCount}`} color="success" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Add Task
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Task title"
                      placeholder="Prepare sprint retro notes"
                      value={newTitle}
                      onChange={(event) => setNewTitle(event.target.value)}
                      fullWidth
                      required
                      inputProps={{ 'aria-label': 'Task title' }}
                    />
                    <TextField
                      label="Due date"
                      type="date"
                      value={newDueDate}
                      onChange={(event) => setNewDueDate(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 'aria-label': 'Due date' }}
                    />
                    <Button variant="contained" type="submit" size="large">
                      Add Task
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card elevation={0}>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                    Task List
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="sort-by-label">Sort by</InputLabel>
                    <Select
                      labelId="sort-by-label"
                      value={sortBy}
                      label="Sort by"
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      <MenuItem value="createdAt">Created Time</MenuItem>
                      <MenuItem value="dueDate">Due Date</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="completed">Status</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="order-label">Order</InputLabel>
                    <Select
                      labelId="order-label"
                      value={order}
                      label="Order"
                      onChange={(event) => setOrder(event.target.value)}
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {loading && <Typography>Loading tasks...</Typography>}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {!loading && todos.length === 0 ? (
                  <Typography color="text.secondary">No tasks yet. Add your first one.</Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {todos.map((todo) => (
                      <Card key={todo.id} variant="outlined" className="todo-row">
                        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Checkbox
                              checked={todo.completed}
                              onChange={() => handleToggleCompleted(todo)}
                              inputProps={{ 'aria-label': `Mark ${todo.title} complete` }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  opacity: todo.completed ? 0.65 : 1,
                                }}
                              >
                                {todo.title}
                              </Typography>
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Created: {todo.createdAtHuman}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Due: {todo.dueDate || 'No due date'}
                                </Typography>
                              </Stack>
                            </Box>
                            <IconButton
                              color="primary"
                              aria-label={`Edit ${todo.title}`}
                              onClick={() => openEditDialog(todo)}
                            >
                              <EditRoundedIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              aria-label={`Delete ${todo.title}`}
                              onClick={() => handleDelete(todo.id)}
                            >
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Dialog open={Boolean(editingTodo)} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Task title"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Due date"
              type="date"
              value={editDueDate}
              onChange={(event) => setEditDueDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;