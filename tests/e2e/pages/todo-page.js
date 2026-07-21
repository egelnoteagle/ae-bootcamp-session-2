const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Task title').first();
    this.dueDateInput = page.getByLabel('Due date').first();
    this.addButton = page.getByRole('button', { name: 'Add Task' });
    this.sortBySelect = page.getByLabel('Sort by');
    this.orderSelect = page.getByLabel('Order');
  }

  async open() {
    await this.page.goto('/');
    await expect(this.page.getByText('TaskFlow 2026')).toBeVisible();
  }

  async addTask(title, dueDate) {
    await this.titleInput.fill(title);
    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
    }
    await this.addButton.click();
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async addTaskWithoutDueDate(title) {
    await this.titleInput.fill(title);
    await this.addButton.click();
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async markTaskComplete(title) {
    const checkbox = this.page.getByLabel(`Mark ${title} complete`);
    await checkbox.click();
    await expect(checkbox).toBeChecked();
  }

  async openEditTask(title) {
    await this.page.getByLabel(`Edit ${title}`).click();
    await expect(this.page.getByRole('dialog', { name: 'Edit Task' })).toBeVisible();
  }

  async saveTaskEdit(nextTitle, nextDueDate) {
    const dialog = this.page.getByRole('dialog', { name: 'Edit Task' });
    await dialog.getByLabel('Task title').fill(nextTitle);
    await dialog.getByLabel('Due date').fill(nextDueDate);
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(this.page.getByText(nextTitle)).toBeVisible();
  }

  async deleteTask(title) {
    await this.page.getByLabel(`Delete ${title}`).click();
    await expect(this.page.getByText(title)).not.toBeVisible();
  }

  async sortBy(fieldName, orderName) {
    await this.sortBySelect.click();
    await this.page.getByRole('option', { name: fieldName }).click();

    await this.orderSelect.click();
    await this.page.getByRole('option', { name: orderName }).click();
  }

  taskRow(title) {
    return this.page.locator('.todo-row', { hasText: title }).first();
  }

  async assertDueDateVisible(dueDate) {
    await expect(this.page.getByText(`Due: ${dueDate}`).first()).toBeVisible();
  }

  async assertCreatedLabelVisible() {
    await expect(this.page.getByText(/^Created:/).first()).toBeVisible();
  }
}

module.exports = { TodoPage };
