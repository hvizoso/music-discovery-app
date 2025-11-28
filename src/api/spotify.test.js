import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fetchPlaylistById from './spotify.js';

describe('src/api/spotify.fetchPlaylistById', () => {
  const OLD_LOCALSTORAGE = global.localStorage;

  beforeEach(() => {
    // reset fetch mock
    global.fetch = jest.fn();
    // simple localStorage mock getItem
    const store = {};
    global.localStorage = {
      getItem: jest.fn((k) => store[k]),
      setItem: jest.fn((k, v) => { store[k] = v; }),
      removeItem: jest.fn((k) => { delete store[k]; })
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.localStorage = OLD_LOCALSTORAGE;
    delete global.fetch;
  });

  test('throws when id is missing', async () => {
    await expect(fetchPlaylistById('')).rejects.toThrow('Missing playlist id');
  });

  test('returns data when fetch ok', async () => {
    const fakeData = { id: 'p1', name: 'Playlist 1' };
    // mock fetch to return ok response
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => fakeData });

    const result = await fetchPlaylistById('p1');
    expect(result).toEqual(fakeData);
    expect(global.fetch).toHaveBeenCalledWith('https://api.spotify.com/v1/playlists/p1', { headers: {} });
  });

  test('throws Playlist not found on 404', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404, text: async () => 'not found' });

    await expect(fetchPlaylistById('missing')).rejects.toMatchObject({ message: 'Playlist not found', code: 404 });
  });

  test('throws API error with status and text when non-ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'server error' });

    await expect(fetchPlaylistById('bad')).rejects.toMatchObject({ message: expect.stringContaining('API error: 500 server error'), code: 500 });
  });
});
