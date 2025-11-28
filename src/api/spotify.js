export async function fetchPlaylistById(id) {
	// id: string
	try {
		if (!id) throw new Error('Missing playlist id');
		// Récupération du token si disponible (adapter selon votre gestion d'auth)
		const token = localStorage.getItem('spotify_token') || localStorage.getItem('token') || '';
		const headers = token ? { Authorization: `Bearer ${token}` } : {};

		const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, { headers });

		if (res.status === 404) {
			const err = new Error('Playlist not found');
			err.code = 404;
			throw err;
		}
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			const err = new Error(`API error: ${res.status} ${text}`);
			err.code = res.status;
			throw err;
		}
		const data = await res.json();
		return data;
	} catch (error) {
		// Remonter l'erreur pour que le composant affiche un message adapté
		throw error;
	}
}

export default fetchPlaylistById;
