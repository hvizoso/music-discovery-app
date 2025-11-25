import { fetchPlaylistById } from "../api/spotify-playlists.js";

/**
 * Récupère une playlist via fetchPlaylistById et compte les occurrences de chaque artiste.
 *
 * @param {string} token - Token d'accès Spotify
 * @param {string} playlistId - ID de la playlist
 * @returns {Promise<Object|undefined>} - Objet { "Artist Name": count, ... } ou undefined en cas d'erreur
 */
export async function artistCountForPlaylist(token, playlistId) {
  try {
    const res = await fetchPlaylistById(token, playlistId);

    // normalize to array of track items (supports res.data.tracks.items or res.tracks.items or res.items)
    const items = (res && (res.data?.tracks?.items ?? res.tracks?.items ?? res.items)) || [];

    const counts = {};

    for (const item of items) {
      // Spotify playlist track item shape : { track: { artists: [ { name } ] } }
      const track = item?.track ?? item;
      const artists = Array.isArray(track?.artists) ? track.artists : [];

      for (const artist of artists) {
        const name = artist?.name ?? "Unknown Artist";
        counts[name] = (counts[name] || 0) + 1;
      }
    }

    return counts;
  } catch (err) {
    // tests expect console.error to be called with a message and the error
    console.error("Error fetching playlist", err);
    return undefined;
  }
}

export default artistCountForPlaylist;