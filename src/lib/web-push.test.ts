import { afterEach, describe, expect, it, vi } from 'vitest';
import { isPushSupported, urlBase64ToUint8Array } from '@/lib/web-push';

describe('urlBase64ToUint8Array', () => {
  it('decodes the url safe base64 of a VAPID key', () => {
    const bytes = urlBase64ToUint8Array('AQID_-A');

    expect(Array.from(bytes)).toEqual([1, 2, 3, 255, 224]);
  });

  it('adds the padding the browser strips', () => {
    expect(Array.from(urlBase64ToUint8Array('AQI'))).toEqual([1, 2]);
    expect(Array.from(urlBase64ToUint8Array('AQ'))).toEqual([1]);
  });

  it('decodes a real sized public key to 65 bytes', () => {
    const key =
      'BBU26diG5bXINo14ih6YbUqTjyZdWPtNcevqvMjCgWofXWq4r2J3nP_2rG5JfhdS_W51JU9cdnobdpLRjB08W20';

    expect(urlBase64ToUint8Array(key)).toHaveLength(65);
  });
});

describe('isPushSupported', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false without a browser', () => {
    expect(isPushSupported()).toBe(false);
  });

  it('needs the service worker, the push manager and the notification API', () => {
    vi.stubGlobal('window', { PushManager: class {}, Notification: class {} });
    vi.stubGlobal('navigator', { serviceWorker: {} });

    expect(isPushSupported()).toBe(true);
  });

  it('is false on a browser that cannot push, such as Safari on iPhone outside the home screen', () => {
    vi.stubGlobal('window', { Notification: class {} });
    vi.stubGlobal('navigator', { serviceWorker: {} });

    expect(isPushSupported()).toBe(false);
  });
});
