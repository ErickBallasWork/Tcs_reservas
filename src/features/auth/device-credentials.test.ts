import { describe, expect, it } from 'vitest';
import {
  describeDevice,
  generateDeviceSecret,
  parsePendingRequest,
} from '@/features/auth/device-credentials';

describe('generateDeviceSecret', () => {
  it('is url safe and long enough for the API', () => {
    const secret = generateDeviceSecret();

    expect(secret).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('differs on every call', () => {
    expect(generateDeviceSecret()).not.toBe(generateDeviceSecret());
  });
});

describe('parsePendingRequest', () => {
  const valid = {
    requestId: '0a4fd1a8-7b3c-4e6e-9f6e-2a7d6f0b2c11',
    deviceSecret: 'a'.repeat(43),
    email: 'ana@tcs.com',
  };

  it('reads a stored request', () => {
    expect(parsePendingRequest(JSON.stringify(valid))).toEqual(valid);
  });

  it.each([null, '', 'not json', '{}', JSON.stringify({ ...valid, requestId: 'x' })])(
    'ignores %j',
    (raw) => {
      expect(parsePendingRequest(raw)).toBeNull();
    },
  );
});

describe('describeDevice', () => {
  it.each([
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
      'Chrome en Windows',
    ],
    [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36 Edg/126.0',
      'Edge en Windows',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      'Safari en iOS',
    ],
    ['Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0', 'Firefox en Linux'],
    ['something else', 'Navegador'],
  ])('describes %s', (userAgent, expected) => {
    expect(describeDevice(userAgent)).toBe(expected);
  });
});
