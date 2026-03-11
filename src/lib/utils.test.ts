import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500');
    expect(cn('px-2', 'px-4')).toBe('px-4'); // tailwind-merge resolves conflicts
  });
});
