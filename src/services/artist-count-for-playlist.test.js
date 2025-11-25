import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { artistCountForPlaylist } from "./artist-count-for-playlist.js";

// Mock the API module that artistCountForPlaylist depends on
jest.mock("../api/spotify-playlists.js", () => ({
  fetchPlaylistById: jest.fn(),
}));

import { fetchPlaylistById } from "../api/spotify-playlists.js";

// Helper to build playlist shape
function makePlaylist(trackItems) {
  return {
    tracks: {
      items: trackItems.map((t) => ({
        track: {
          name: t.name,
          artists: (t.artists || []).map((a) => ({ name: a })),
        },
      })),
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("artistCountForPlaylist", () => {
  test("calls fetchPlaylistById with token and playlistId", async () => {
    const token = "token123";
    const playlistId = "playlistABC";
    fetchPlaylistById.mockResolvedValue({
      data: makePlaylist([
        { name: "Song 1", artists: ["Artist A"] },
        { name: "Song 2", artists: ["Artist B"] },
        { name: "Song 3", artists: ["Artist C", "Artist A"] },
      ]),
      error: null,
    });

    const result = await artistCountForPlaylist(token, playlistId);

    expect(fetchPlaylistById).toHaveBeenCalledTimes(1);
    expect(fetchPlaylistById).toHaveBeenCalledWith(token, playlistId);
    expect(result).toEqual({ "Artist A": 2, "Artist B": 1, "Artist C": 1 });
  });

  test("returns undefined and logs error when fetchPlaylistById rejects", async () => {
    const mockError = new Error("Network failure");
    fetchPlaylistById.mockRejectedValue(mockError);
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await artistCountForPlaylist("t", "p");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    // First arg string, second the error object (implementation logs both)
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/Error fetching playlist/);
    expect(callArgs[1]).toBe(mockError);

    consoleSpy.mockRestore();
  });

  test("handles response with tracks at top level (res.tracks.items)", async () => {
    fetchPlaylistById.mockResolvedValue({
      tracks: makePlaylist([
        { name: "S1", artists: ["A"] },
        { name: "S2", artists: ["B", "A"] },
      ]).tracks,
    });

    const result = await artistCountForPlaylist("t", "p");
    expect(result).toEqual({ A: 2, B: 1 });
  });

  test("handles response with items at top level (res.items)", async () => {
    fetchPlaylistById.mockResolvedValue({
      items: [
        { artists: [{ name: "X" }] },
        { artists: [{ name: "Y" }, { name: "X" }] },
      ],
    });

    const result = await artistCountForPlaylist("t", "p");
    expect(result).toEqual({ X: 2, Y: 1 });
  });

  test("handles items with null track and artists without name", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: {
        tracks: {
          items: [
            { track: null },
            { track: { artists: [{}, { name: "Z" }] } },
          ],
        },
      },
    });

    const result = await artistCountForPlaylist("t", "p");
    expect(result).toEqual({ "Unknown Artist": 1, Z: 1 });
  });

  test("returns empty object when no items present", async () => {
    fetchPlaylistById.mockResolvedValue({});
    const result = await artistCountForPlaylist("t", "p");
    expect(result).toEqual({});
  });
});