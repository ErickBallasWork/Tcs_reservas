import { describe, expect, it } from 'vitest';
import { parsePublicConfig } from '@/lib/public-config';

describe('parsePublicConfig', () => {
  it('accepts an http api url', () => {
    expect(parsePublicConfig({ apiUrl: 'http://localhost:3001/api/v1' })).toEqual({
      apiUrl: 'http://localhost:3001/api/v1',
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
});
