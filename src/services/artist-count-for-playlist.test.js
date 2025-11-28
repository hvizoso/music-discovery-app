/* istanbul ignore file */
jest.mock('../api/spotify-playlists.js');

import { artistCountForPlaylist } from './artist-count-for-playlist.js';
import { fetchPlaylistById } from '../api/spotify-playlists.js';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('artistCountForPlaylist', () => {
    test('compte les artistes avec data.tracks.items', async () => {
        fetchPlaylistById.mockResolvedValueOnce({
            data: {
                tracks: {
                    items: [
                        { track: { id: 't1', artists: [{ name: 'A' }, { name: 'B' }] } },
                        { track: { id: 't2', artists: [{ name: 'A' }] } },
                    ],
                },
            },
        });

        const result = await artistCountForPlaylist('token', 'playlist1');
        expect(result).toEqual({ A: 2, B: 1 });
    });

    test('gère la forme playlist.tracks.items', async () => {
        fetchPlaylistById.mockResolvedValueOnce({
            playlist: {
                tracks: {
                    items: [
                        { track: { id: 't1', artists: [{ name: 'X' }] } },
                    ],
                },
            },
        });

        const result = await artistCountForPlaylist('token', 'playlist2');
        expect(result).toEqual({ X: 1 });
    });

    test('gère items sans wrapper "track" et fallback id', async () => {
        fetchPlaylistById.mockResolvedValueOnce({
            tracks: {
                items: [
                    { id: 't3', artists: [{ name: 'C' }, { id: 'artist-id-1' }] },
                    { id: 't4', artists: [{ name: 'C' }] },
                ],
            },
        });

        const result = await artistCountForPlaylist('token', 'playlist3');
        expect(result).toEqual({ C: 2, 'artist-id-1': 1 });
    });

    test('retourne {} si pas de tracks valides', async () => {
        fetchPlaylistById.mockResolvedValueOnce({ data: { tracks: null } });
        const result = await artistCountForPlaylist('token', 'playlist4');
        expect(result).toEqual({});
    });

    test('utilise "Unknown" si artiste sans name ni id', async () => {
        fetchPlaylistById.mockResolvedValueOnce({
            data: {
                tracks: {
                    items: [
                        { track: { id: 't1', artists: [{}] } },
                    ],
                },
            },
        });

        const result = await artistCountForPlaylist('token', 'playlist5');
        expect(result).toEqual({ Unknown: 1 });
    });

    test('rejette si token absent', async () => {
        await expect(artistCountForPlaylist(null, 'playlist')).rejects.toThrow('Token requis');
    });

    test('rejette si playlistId absent', async () => {
        await expect(artistCountForPlaylist('token', '')).rejects.toThrow('playlistId requis');
    });

    test('rejette si l API renvoie un champ error', async () => {
        fetchPlaylistById.mockResolvedValueOnce({ error: 'API error occurred' });
        await expect(artistCountForPlaylist('token', 'playlist6')).rejects.toThrow('API error occurred');
    });

    test('rejette si fetchPlaylistById rejette', async () => {
        fetchPlaylistById.mockRejectedValueOnce(new Error('network failure'));
        await expect(artistCountForPlaylist('token', 'playlist7')).rejects.toThrow('network failure');
    });
});
