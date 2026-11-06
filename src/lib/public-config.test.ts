import { describe, expect, it } from 'vitest';
import { parsePublicConfig } from '@/lib/public-config';

describe('parsePublicConfig', () => {
  it('accepts an http api url', () => {
    expect(parsePublicConfig({ apiUrl: 'http://localhost:3001/api/v1' })).toEqual({
      apiUrl: 'http://localhost:3001/api/v1',
      enableTestLogin: false,
    });
  });

  it('removes trailing slashes from the api url', () => {
    expect(parsePublicConfig({ apiUrl: 'https://api.example.com/api/v1/' }).apiUrl).toBe(
      'https://api.example.com/api/v1',
    );
  });

  it('rejects a missing api url', () => {
    expect(() => parsePublicConfig({ apiUrl: undefined })).toThrow('apiUrl');
  });

  it.each(['localhost:3001', 'ftp://example.com', 'not a url'])(
    'rejects the invalid api url "%s"',
    (apiUrl) => {
      expect(() => parsePublicConfig({ apiUrl })).toThrow('apiUrl');
    },
  );

  it.each([
    ['true', true],
    ['false', false],
  ])('reads the test login flag "%s"', (enableTestLogin, expected) => {
    const config = parsePublicConfig({ apiUrl: 'http://localhost:3001/api/v1', enableTestLogin });

    expect(config.enableTestLogin).toBe(expected);
  });

  it('rejects an invalid test login flag', () => {
    expect(() =>
      parsePublicConfig({ apiUrl: 'http://localhost:3001/api/v1', enableTestLogin: 'maybe' }),
    ).toThrow('enableTestLogin');
  });
});
