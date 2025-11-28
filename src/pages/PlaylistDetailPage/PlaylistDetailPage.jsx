 import { useParams } from 'react-router-dom';

export default function PlaylistDetailPage() {
  const { id } = useParams();

  return (
    <main className="page playlist-detail-page">
      <h1>Playlist Detail</h1>
      <p data-testid="playlist-id">ID: {id}</p>
    </main>
  );
}
