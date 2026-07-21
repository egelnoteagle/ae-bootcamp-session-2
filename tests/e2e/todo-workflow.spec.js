const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo-page');

test.describe('Todo critical workflows', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.open();
  });

  test('creates a task with due date and marks it complete', async () => {
    const taskTitle = `E2E Task ${Date.now()}`;
    await todoPage.addTask(taskTitle, '2026-12-15');

    await todoPage.assertDueDateVisible('2026-12-15');
    await todoPage.markTaskComplete(taskTitle);
  });

  test('edits an existing task title and due date', async () => {
    const originalTitle = `Edit Me ${Date.now()}`;
    const updatedTitle = `${originalTitle} Updated`;

    await todoPage.addTaskWithoutDueDate(originalTitle);
    await todoPage.openEditTask(originalTitle);
    await todoPage.saveTaskEdit(updatedTitle, '2026-11-05');
    await todoPage.assertDueDateVisible('2026-11-05');
  });

  test('deletes a task from the list', async () => {
    const taskTitle = `Delete Me ${Date.now()}`;
    await todoPage.addTaskWithoutDueDate(taskTitle);
    await todoPage.deleteTask(taskTitle);
  });

  test('sorts tasks by title ascending', async () => {
    const firstTitle = `AAA-${Date.now()}`;
    const secondTitle = `ZZZ-${Date.now()}`;

    await todoPage.addTaskWithoutDueDate(secondTitle);
    await todoPage.addTaskWithoutDueDate(firstTitle);
    await todoPage.sortBy('Title', 'Ascending');

    const firstRow = todoPage.taskRow(firstTitle);
    const secondRow = todoPage.taskRow(secondTitle);
    const firstBox = await firstRow.boundingBox();
    const secondBox = await secondRow.boundingBox();

    expect(firstBox).toBeTruthy();
    expect(secondBox).toBeTruthy();
    expect(firstBox.y).toBeLessThan(secondBox.y);
  });

  test('shows created timestamp in human-readable form', async () => {
    const taskTitle = `Timestamp ${Date.now()}`;
    await todoPage.addTaskWithoutDueDate(taskTitle);
    await todoPage.assertCreatedLabelVisible();
  });

  test('prevents creating an empty task title', async () => {
    const totalChip = todoPage.page.getByText(/^Total:/).first();
    const beforeText = await totalChip.textContent();
    const beforeCount = Number((beforeText || '0').replace(/[^0-9]/g, ''));

    await todoPage.titleInput.fill('   ');
    await todoPage.addButton.click();

    const afterText = await totalChip.textContent();
    const afterCount = Number((afterText || '0').replace(/[^0-9]/g, ''));
    expect(afterCount).toBe(beforeCount);
  });

  test('sort controls are available for user workflow', async () => {
    await expect(todoPage.sortBySelect).toBeVisible();
    await expect(todoPage.orderSelect).toBeVisible();
  });
});
