const { isValidDueDate, serializeTodo, toHumanReadable } = require('../src/app');

describe('Todo helper functions', () => {
  describe('isValidDueDate', () => {
    test('accepts null and blank values', () => {
      expect(isValidDueDate(null)).toBe(true);
      expect(isValidDueDate(undefined)).toBe(true);
      expect(isValidDueDate('')).toBe(true);
    });

    test('accepts YYYY-MM-DD', () => {
      expect(isValidDueDate('2026-12-31')).toBe(true);
    });

    test('rejects invalid shapes', () => {
      expect(isValidDueDate('31-12-2026')).toBe(false);
      expect(isValidDueDate('2026/12/31')).toBe(false);
      expect(isValidDueDate(1234)).toBe(false);
    });
  });

  describe('toHumanReadable', () => {
    test('returns a readable date string', () => {
      const result = toHumanReadable('2026-07-21T10:30:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('serializeTodo', () => {
    test('maps DB row to client payload', () => {
      const row = {
        id: 7,
        title: 'Ship release notes',
        due_date: '2026-07-23',
        completed: 1,
        created_at: '2026-07-21T10:30:00.000Z',
        updated_at: '2026-07-21T10:30:00.000Z',
      };

      const payload = serializeTodo(row);
      expect(payload).toMatchObject({
        id: 7,
        title: 'Ship release notes',
        dueDate: '2026-07-23',
        completed: true,
      });
      expect(payload.createdAtHuman).toBeTruthy();
    });
  });
});