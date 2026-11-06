import { describe, expect, it } from 'vitest';
import { parseAccessRequestForm } from '@/features/auth/access-request-schema';

const valid = { email: 'ana@tcs.com', fullName: 'Ana Pérez', department: '' };

describe('parseAccessRequestForm', () => {
  it('accepts a corporate email and trims and lowercases it', () => {
    const result = parseAccessRequestForm({ ...valid, email: '  Ana@TCS.com ' });

    expect(result).toEqual({ success: true, data: { ...valid, email: 'ana@tcs.com' } });
  });

  it('accepts the Banco Pichincha domain', () => {
    expect(parseAccessRequestForm({ ...valid, email: 'luis@pichincha.com' }).success).toBe(true);
  });

  it.each(['ana@gmail.com', 'ana@tcs.com.evil.io', 'ana@sub.tcs.com', 'ana@xtcs.com'])(
    'rejects the domain of %s',
    (email) => {
      const result = parseAccessRequestForm({ ...valid, email });

      expect(result).toMatchObject({
        success: false,
        errors: { email: 'Solo se permiten correos @tcs.com o @pichincha.com.' },
      });
    },
  );

  it.each(['', 'ana', 'ana@', '@tcs.com'])('rejects the malformed email "%s"', (email) => {
    const result = parseAccessRequestForm({ ...valid, email });

    expect(result).toMatchObject({
      success: false,
      errors: { email: 'Escribe un correo válido.' },
    });
  });

  it('requires the full name', () => {
    const result = parseAccessRequestForm({ ...valid, fullName: '   ' });

    expect(result).toMatchObject({
      success: false,
      errors: { fullName: 'Escribe tu nombre completo.' },
    });
  });

  it('reports every invalid field at once', () => {
    const result = parseAccessRequestForm({
      email: 'x',
      fullName: '',
      department: 'd'.repeat(121),
    });

    expect(result.success).toBe(false);
    if (!result.success)
      expect(Object.keys(result.errors).sort()).toEqual(['department', 'email', 'fullName']);
  });
});
