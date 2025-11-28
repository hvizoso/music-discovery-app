import { fetchPlaylistById } from '../api/spotify-playlists.js';

/**
 * Compte les apparitions de chaque artiste dans une playlist.
 * @param {string} token - Token d'accès Spotify
 * @param {string} playlistId - ID de la playlist
 * @returns {Promise<Record<string, number>>} - objet { "Artist Name": count, ... }
 */
export async function artistCountForPlaylist(token, playlistId) {
    if (!token) {
        throw new Error('Token requis');
    }
    if (!playlistId) {
        throw new Error('playlistId requis');
    }

    const res = await fetchPlaylistById(token, playlistId);

    // Normaliser différentes formes de réponse possibles
    const error = res?.error ?? null;
    const data = res?.playlist ?? res?.data ?? res ?? null;

    if (error) {
        throw new Error(String(error));
    }

    if (!data || !data.tracks || !Array.isArray(data.tracks.items)) {
        return {};
    }

    const counts = {};

    for (const item of data.tracks.items) {
        const track = item?.track ?? item;
        if (!track || !Array.isArray(track.artists)) continue;

        for (const artist of track.artists) {
            const name = artist?.name ?? artist?.id ?? 'Unknown';
            counts[name] = (counts[name] || 0) + 1;
        }
    }

    return counts;
}