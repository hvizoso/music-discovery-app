const { generateAccessToken } = require("./utils.cjs");
const { fetchPlaylistById } = require("../src/api/spotify-playlists");

/**
 * Main function to demonstrate fetching a Spotify playlist.
 */
const main = async () => {
  var playlistId = "4BAJU7ds54dbPZlVI6Kysk";

  const token = await generateAccessToken();

  // fetch playlist by ID
  fetchPlaylistById(token, playlistId)
    .then(({ data }) => {
      // extract track names and artist names
      const tracks = data.tracks.items.map((item) => ({
        trackName: item.track.name,
        artistNames: item.track.artists.map((artist) => artist.name).join(", "),
      }));

      console.log(`Playlist: ${data.name} by ${data.owner.display_name}`);
      console.table(tracks);
    })
    .catch((error) => {
      console.error("Error fetching playlist:", error);
    });
};

main();