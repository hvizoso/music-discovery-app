// src/components/PlayListItem.test.jsx

import { describe, expect, test } from '@jest/globals'
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import TopArtistItem from './TopArtistItem';

describe('TopArtistItem component', () => {
    test('renders artist information correctly', () => {
        const artist = {
            id: 'artist1',
            name: 'Test Artist',
            images: [{ url: 'test.jpg' }, { url: 'test-medium.jpg' }, { url: 'test-small.jpg' }],
            genres: ['pop', 'rock'],
            followers: { total: 1000 },
            popularity: 85,
            external_urls: { spotify: 'https://open.spotify.com/artist/artist1' }
        };
        render(<TopArtistItem artist={artist} index={0} />);

        // Verify list item rendering and having expected content
        const listItem = screen.getByTestId(`top-artist-item-${artist.id}`);
        expect(listItem).toBeInTheDocument();

        // should contain artist image (use alt text)
        const img = within(listItem).getByAltText(artist.name);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', artist.images[1].url);

        // details assertions
        expect(listItem).toHaveTextContent(artist.name);
        expect(listItem).toHaveTextContent(`Genres: ${artist.genres.join(', ')}`);
        expect(listItem).toHaveTextContent(`Followers: ${artist.followers.total.toLocaleString()}`);
        expect(listItem).toHaveTextContent(`Popularity: ${artist.popularity}`);

        // link to artist page
        const link = within(listItem).getByRole('link', { name: /view artist/i });
        expect(link).toHaveAttribute('href', artist.external_urls.spotify);

        // uncomment to debug
        //screen.debug();
    });

    test('handles missing artist image gracefully', () => {
        const artist = {
            id: 'artist2',
            name: 'No Image Artist',
            genres: ['jazz'],
            // images: [],
            followers: { total: 500 },
            external_urls: { spotify: 'https://open.spotify.com/artist/artist2' }
        };
        render(<TopArtistItem artist={artist} index={1} />);

        // Verify list item rendering and having expected content
        const listItem = screen.getByTestId(`top-artist-item-${artist.id}`);
        expect(listItem).toBeInTheDocument();

        // should not contain artist image (query by alt)
        expect(within(listItem).queryByAltText(artist.name)).not.toBeInTheDocument();

        // details assertions
        expect(listItem).toHaveTextContent(artist.name);
        expect(listItem).toHaveTextContent(`Genres: ${artist.genres.join(', ')}`);
        expect(listItem).toHaveTextContent(`Followers: ${artist.followers.total.toLocaleString()}`);

        // link to artist page
        const link = within(listItem).getByRole('link', { name: /view artist/i });
        expect(link).toHaveAttribute('href', artist.external_urls.spotify);

        // uncomment to debug
        //screen.debug();
    });
    test('affiche 1 si index passé = 0', () => {
    const artist = {
        id: 'artist3',
        name: 'Index Test Artist',
        images: [{ url: 'img.jpg' }],
        genres: ['electro'],
        followers: { total: 123 },
        popularity: 50,
        external_urls: { spotify: 'https://open.spotify.com/artist/artist3' }
    };

    render(<TopArtistItem artist={artist} index={0} />);

    const listItem = screen.getByTestId(`top-artist-item-${artist.id}`);
    // Accepter "1", "1." ou "1)" suivi éventuellement d'espaces et du nom de l'artiste
    expect(listItem).toHaveTextContent(/^1[.)]?\s*Index Test Artist/i);
    });
});