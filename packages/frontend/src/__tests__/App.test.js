import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let todos = [];

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(todos));
  }),

  rest.post('/api/todos', async (req, res, ctx) => {
    const body = await req.json();

    if (!body.title || body.title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Todo title is required' }));
    }

    const createdTodo = {
      id: Date.now(),
      title: body.title,
      dueDate: body.dueDate || null,
      completed: false,
      createdAt: '2026-07-21T08:00:00.000Z',
      createdAtHuman: 'Jul 21, 2026, 8:00 AM',
      updatedAt: '2026-07-21T08:00:00.000Z',
    };

    todos = [createdTodo, ...todos];
    return res(ctx.status(201), ctx.json(createdTodo));
  }),

  rest.patch('/api/todos/:id/complete', async (req, res, ctx) => {
    const body = await req.json();
    const id = Number(req.params.id);
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    }

    todos[index] = { ...todos[index], completed: body.completed };
    return res(ctx.status(200), ctx.json(todos[index]));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    todos = todos.filter((todo) => todo.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id }));
  }),

  rest.put('/api/todos/:id', async (req, res, ctx) => {
    const body = await req.json();
    const id = Number(req.params.id);
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    }

    todos[index] = {
      ...todos[index],
      title: body.title,
      dueDate: body.dueDate,
      completed: body.completed,
    };
    return res(ctx.status(200), ctx.json(todos[index]));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  todos = [
    {
      id: 1,
      title: 'Test Task 1',
      dueDate: null,
      completed: false,
      createdAt: '2026-07-21T08:00:00.000Z',
      createdAtHuman: 'Jul 21, 2026, 8:00 AM',
      updatedAt: '2026-07-21T08:00:00.000Z',
    },
    {
      id: 2,
      title: 'Test Task 2',
      dueDate: '2026-08-01',
      completed: true,
      createdAt: '2026-07-20T08:00:00.000Z',
      createdAtHuman: 'Jul 20, 2026, 8:00 AM',
      updatedAt: '2026-07-20T08:00:00.000Z',
    },
  ];
});
afterAll(() => server.close());

beforeEach(() => {
  todos = [
    {
      id: 1,
      title: 'Test Task 1',
      dueDate: null,
      completed: false,
      createdAt: '2026-07-21T08:00:00.000Z',
      createdAtHuman: 'Jul 21, 2026, 8:00 AM',
      updatedAt: '2026-07-21T08:00:00.000Z',
    },
    {
      id: 2,
      title: 'Test Task 2',
      dueDate: '2026-08-01',
      completed: true,
      createdAt: '2026-07-20T08:00:00.000Z',
      createdAtHuman: 'Jul 20, 2026, 8:00 AM',
      updatedAt: '2026-07-20T08:00:00.000Z',
    },
  ];
});

describe('App Component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('TaskFlow 2026')).toBeInTheDocument();
    expect(screen.getByText(/Manage your priorities/i)).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const input = screen.getByLabelText('Task title');
    await act(async () => {
      await user.type(input, 'New Test Task');
    });

    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    await act(async () => {
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('toggles completion status', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Mark Test Task 1 complete');
    await act(async () => {
      await user.click(checkbox);
    });

    expect(checkbox).toBeChecked();
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch todos/)).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Add your first one.')).toBeInTheDocument();
    });
  });
});