import { describe, expect, test } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlaylistDetailPage from './PlaylistDetailPage.jsx';

describe('PlaylistDetailPage route', () => {
  test('renders the playlist id from the URL params', () => {
    render(
      <MemoryRouter initialEntries={["/playlist/abc123"]}>
        <Routes>
          <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    const idEl = screen.getByTestId('playlist-id');
    expect(idEl).toBeInTheDocument();
    expect(idEl).toHaveTextContent('ID: abc123');
  });
});
