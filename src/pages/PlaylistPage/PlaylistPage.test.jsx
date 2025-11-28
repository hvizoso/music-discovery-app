import React from 'react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Helpers to mock modules (use jest for mocking)
jest.mock('../../hooks/useRequireToken.js', () => ({
  useRequireToken: () => ({ token: 'fake-token' })
}));

const mockFetch = jest.fn();
jest.mock('../../api/spotify-playlists.js', () => ({
  fetchPlaylistById: (...args) => mockFetch(...args)
}));

const mockHandleTokenError = jest.fn();
jest.mock('../../utils/handleTokenError.js', () => ({
  handleTokenError: (...args) => mockHandleTokenError(...args)
}));

import PlaylistPage from './PlaylistPage.jsx';

describe('PlaylistPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders playlist header and tracks when fetch returns data', async () => {
    const fakePlaylist = {
      name: 'My Playlist',
      description: 'A nice playlist',
      images: [{ url: 'cover.jpg' }],
      external_urls: { spotify: 'https://open.spotify/playlist/1' },
      tracks: {
        items: [
          { track: { id: 't1', name: 'Track 1', artists: [{ name: 'A' }], album: { images: [] }, popularity: 10, external_urls: { spotify: 'u' } } },
          { track: { id: 't2', name: 'Track 2', artists: [{ name: 'B' }], album: { images: [] }, popularity: 20, external_urls: { spotify: 'u2' } } }
        ]
      }
    };

    mockFetch.mockResolvedValueOnce({ data: fakePlaylist, error: null });

    render(
      <MemoryRouter initialEntries={["/playlist/playlist1"]}>
        <Routes>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Routes>
      </MemoryRouter>
    );

    // wait for playlist name to appear
    await waitFor(() => expect(screen.getByTestId('playlist-name')).toHaveTextContent('My Playlist'));

    // header items
    expect(screen.getByTestId('playlist-cover')).toHaveAttribute('src', 'cover.jpg');
    expect(screen.getByTestId('playlist-description')).toHaveTextContent('A nice playlist');
    expect(screen.getByTestId('playlist-spotify-link')).toHaveAttribute('href', 'https://open.spotify/playlist/1');

    // tracks list should render two track items
    const list = screen.getByTestId('playlist-tracks-list');
    expect(list).toBeInTheDocument();
    expect(screen.getByTestId('track-item-t1')).toBeInTheDocument();
    expect(screen.getByTestId('track-item-t2')).toBeInTheDocument();
  });

  test('renders no-tracks message when playlist has no items', async () => {
    const fakePlaylist = {
      name: 'Empty',
      images: [],
      external_urls: {},
      tracks: { items: [] }
    };
    mockFetch.mockResolvedValueOnce({ data: fakePlaylist, error: null });

    render(
      <MemoryRouter initialEntries={["/playlist/empty"]}>
        <Routes>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('playlist-name')).toHaveTextContent('Empty'));
    expect(screen.getByTestId('no-tracks')).toBeInTheDocument();
  });

  test('handles API error response and displays error when handleTokenError returns false', async () => {
    mockHandleTokenError.mockReturnValue(false);
    mockFetch.mockResolvedValueOnce({ data: null, error: 'API failure' });

    render(
      <MemoryRouter initialEntries={["/playlist/bad"]}>
        <Routes>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('API failure');
  });

  test('logs fallback when tracks getter throws (inner catch)', async () => {
    // create tracks object whose 'items' getter throws only on first access
    let called = false;
    const badTracks = {};
    Object.defineProperty(badTracks, 'items', {
      get() {
        if (!called) {
          called = true;
          throw new Error('bad format');
        }
        return [];
      }
    });

    const fakePlaylist = {
      name: 'Bad Tracks',
      images: [],
      external_urls: {},
      tracks: badTracks
    };

    mockFetch.mockResolvedValueOnce({ data: fakePlaylist, error: null });

    // spy on console.log to ensure inner catch executes
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/playlist/badtracks"]}>
        <Routes>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('playlist-name')).toHaveTextContent('Bad Tracks'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('displays error when fetch promise rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network failure'));

    render(
      <MemoryRouter initialEntries={["/playlist/reject"]}>
        <Routes>
          <Route path="/playlist/:id" element={<PlaylistPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent(/network failure/i);
  });
});
