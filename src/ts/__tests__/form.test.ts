import { describe, it, expect } from 'vitest';
import { validateField } from '../form';

describe('validateField — name', () => {
  it('returns error for empty name', () => {
    expect(validateField('name', '')).toBeTruthy();
  });

  it('returns error for single character name', () => {
    expect(validateField('name', 'A')).toBeTruthy();
  });

  it('returns null for valid name (2 chars)', () => {
    expect(validateField('name', 'Ал')).toBeNull();
  });

  it('returns null for normal name', () => {
    expect(validateField('name', 'Александр')).toBeNull();
  });

  it('returns error for whitespace-only name', () => {
    expect(validateField('name', '  ')).toBeTruthy();
  });
});

describe('validateField — phone', () => {
  it('returns error for empty phone', () => {
    expect(validateField('phone', '')).toBeTruthy();
  });

  it('returns error for letters in phone', () => {
    expect(validateField('phone', 'abc')).toBeTruthy();
  });

  it('returns null for valid Russian phone', () => {
    expect(validateField('phone', '+7 900 000 00 00')).toBeNull();
  });

  it('returns null for phone with dashes', () => {
    expect(validateField('phone', '+7-900-000-00-00')).toBeNull();
  });

  it('returns null for simple digits', () => {
    expect(validateField('phone', '9000000000')).toBeNull();
  });
});

describe('validateField — email', () => {
  it('returns error for empty email', () => {
    expect(validateField('email', '')).toBeTruthy();
  });

  it('returns error for missing @ in email', () => {
    expect(validateField('email', 'notanemail')).toBeTruthy();
  });

  it('returns error for missing domain', () => {
    expect(validateField('email', 'user@')).toBeTruthy();
  });

  it('returns null for valid email', () => {
    expect(validateField('email', 'user@example.com')).toBeNull();
  });

  it('returns null for email with subdomain', () => {
    expect(validateField('email', 'user@mail.example.co.uk')).toBeNull();
  });
});

describe('validateField — comment', () => {
  it('returns error for empty comment', () => {
    expect(validateField('comment', '')).toBeTruthy();
  });

  it('returns error for comment shorter than 10 chars', () => {
    expect(validateField('comment', 'short')).toBeTruthy();
  });

  it('returns null for exactly 10 chars', () => {
    expect(validateField('comment', '1234567890')).toBeNull();
  });

  it('returns null for long comment', () => {
    expect(validateField('comment', 'Это длинный комментарий с подробным описанием задачи')).toBeNull();
  });

  it('returns error for whitespace-only comment', () => {
    expect(validateField('comment', '          ')).toBeTruthy();
  });
});
