import React, { useEffect, useState } from 'react';
import '../PlaylistPage.css';
import '../PageLayout.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';

export default function PlaylistPage() {
	// Récupère l'id de la playlist depuis l'URL
	const { id } = useParams();
	const navigate = useNavigate();

	// token requis pour appeler l'API Spotify
	const { token } = useRequireToken();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [playlist, setPlaylist] = useState(null);

	useEffect(() => {
		if (!token) return; // wait for token or redirect

		setLoading(true);
		fetchPlaylistById(token, id)
			.then(res => {
				if (res.error) {
					if (!handleTokenError(res.error, navigate)) {
						setError(res.error);
					}
					return;
				}
				// Stocke le playlist object pour affichage
				setPlaylist(res.data);

				// Log the full playlist object for inspection
				console.log('Fetched playlist:', res.data);

				// If tracks exist, log the first track object
				try {
					const firstTrack = res.data.tracks?.items?.[0]?.track;
					console.log('First track:', firstTrack);
				} catch (e) {
					console.log('No tracks found or unexpected format', e);
				}
			})
			.catch(err => {
				console.error('Failed to fetch playlist:', err);
				setError(err.message || String(err));
			})
			.finally(() => setLoading(false));
	}, [token, id, navigate]);

	return (
		<main className="playlist-page">
			<h1>Playlist Page</h1>
			<p data-testid="playlist-id">ID: {id}</p>

			{/* Header: cover, name, description, link */}
			{playlist && (
				<header className="playlist-header" data-testid="playlist-header">
					{playlist.images?.[0]?.url && (
						<img
							src={playlist.images[0].url}
							alt={playlist.name || 'Playlist cover'}
							className="playlist-cover"
							data-testid="playlist-cover"
						/>
					)}
					<div className="playlist-meta">
						<h2 className="playlist-title" data-testid="playlist-name">{playlist.name}</h2>
						{playlist.description && (
							<p className="playlist-description" data-testid="playlist-description">{playlist.description}</p>
						)}
						{playlist.external_urls?.spotify && (
							<p className="playlist-link-wrapper">
								<a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer" data-testid="playlist-spotify-link">Open in Spotify</a>
							</p>
						)}
					</div>
				</header>
			)}

			{loading && <div data-testid="loading">Loading…</div>}
			{error && <div role="alert">{error}</div>}

			{/* Tracks list */}
			{!loading && !error && playlist && (
				<section className="playlist-tracks">
					<h3 className="tracks-section-title">Tracks</h3>
					{Array.isArray(playlist.tracks?.items) && playlist.tracks.items.length > 0 ? (
						<ol className="tracks-list" data-testid="playlist-tracks-list">
							{playlist.tracks.items.map((item, idx) => {
								const track = item?.track;
								if (!track) return null;
								return <TrackItem key={track.id || idx} track={track} />;
							})}
						</ol>
					) : (
						<div data-testid="no-tracks">No tracks in this playlist.</div>
					)}
				</section>
			)}
		</main>
	);
}
