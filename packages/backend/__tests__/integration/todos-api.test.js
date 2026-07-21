const request = require('supertest');
const { app } = require('../../src/app');

describe('TODO API integration', () => {
  test('GET /api/todos returns todos with required fields', async () => {
    const response = await request(app).get('/api/todos');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    const firstTodo = response.body[0];
    expect(firstTodo).toHaveProperty('id');
    expect(firstTodo).toHaveProperty('title');
    expect(firstTodo).toHaveProperty('completed');
    expect(firstTodo).toHaveProperty('createdAt');
    expect(firstTodo).toHaveProperty('createdAtHuman');
  });

  test('POST /api/todos creates a todo with due date', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Draft architecture ADR', dueDate: '2026-08-01' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Draft architecture ADR');
    expect(response.body.dueDate).toBe('2026-08-01');
    expect(response.body.completed).toBe(false);
  });

  test('PUT /api/todos/:id updates title and due date', async () => {
    const created = await request(app)
      .post('/api/todos')
      .send({ title: 'Old title', dueDate: null });

    const updated = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ title: 'New title', dueDate: '2026-09-10', completed: false });

    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe('New title');
    expect(updated.body.dueDate).toBe('2026-09-10');
  });

  test('PATCH /api/todos/:id/complete marks task complete', async () => {
    const created = await request(app)
      .post('/api/todos')
      .send({ title: 'Toggle me' });

    const completed = await request(app)
      .patch(`/api/todos/${created.body.id}/complete`)
      .send({ completed: true });

    expect(completed.status).toBe(200);
    expect(completed.body.completed).toBe(true);
  });

  test('DELETE /api/todos/:id removes the todo', async () => {
    const created = await request(app)
      .post('/api/todos')
      .send({ title: 'Delete me' });

    const deleted = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe('Todo deleted successfully');

    const fetchAll = await request(app).get('/api/todos');
    const found = fetchAll.body.find((todo) => todo.id === created.body.id);
    expect(found).toBeUndefined();
  });

  test('GET /api/todos supports sorting by dueDate', async () => {
    await request(app)
      .post('/api/todos')
      .send({ title: 'Late', dueDate: '2026-12-01' });

    await request(app)
      .post('/api/todos')
      .send({ title: 'Early', dueDate: '2026-01-01' });

    const response = await request(app).get('/api/todos?sortBy=dueDate&order=asc');

    expect(response.status).toBe(200);
    const datedTodos = response.body.filter((todo) => Boolean(todo.dueDate));
    expect(datedTodos.length).toBeGreaterThan(1);
    expect(datedTodos[0].dueDate <= datedTodos[datedTodos.length - 1].dueDate).toBe(true);
  });
});
