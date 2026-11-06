import { describe, expect, it } from 'vitest';
import { ApiError } from '@/api/api-error';
import {
  messageForTestLoginError,
  parseTestLoginForm,
} from '@/features/auth/test-login/test-login-form';

describe('parseTestLoginForm', () => {
  it('trims and lowercases the email and keeps the password as typed', () => {
    const result = parseTestLoginForm({ email: '  Admin@TCS.com ', password: ' Secreta ' });

    expect(result).toEqual({
      success: true,
      data: { email: 'admin@tcs.com', password: ' Secreta ' },
    });
  });

  it('requires both fields', () => {
    expect(parseTestLoginForm({ email: ' ', password: '' })).toEqual({
      success: false,
      errors: { email: 'Escribe el correo.', password: 'Escribe la contraseña.' },
    });
  });
});

describe('messageForTestLoginError', () => {
  it('explains wrong credentials', () => {
    const error = new ApiError({ status: 401, code: 'INVALID_CREDENTIALS' });

    expect(messageForTestLoginError(error)).toBe('Correo o contraseña incorrectos');
  });

  it('explains that the test login is disabled', () => {
    const error = new ApiError({ status: 404, code: 'NOT_FOUND' });

    expect(messageForTestLoginError(error)).toBe('El login de pruebas no está habilitado');
  });

  it('asks to wait after too many attempts, whatever the code', () => {
    const error = new ApiError({ status: 429, code: 'UNKNOWN_ERROR' });

    expect(messageForTestLoginError(error)).toBe('Demasiados intentos, espera unos minutos');
  });

  it('shows the message from the error body for any other error', () => {
    const error = new ApiError({
      status: 400,
      code: 'BAD_REQUEST',
      details: ['email must be an email'],
    });

    expect(messageForTestLoginError(error)).toBe('email must be an email');
  });

  it('falls back to the code message when the body has no message', () => {
    const error = new ApiError({ status: 0, code: 'NETWORK_ERROR' });

    expect(messageForTestLoginError(error)).toBe(
      'No hay conexión con el servidor. Revisa tu red e intenta de nuevo.',
    );
  });
});
