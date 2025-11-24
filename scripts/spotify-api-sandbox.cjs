/* ES5 CommonJS sandbox for Spotify API playlist inspection. */
var dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const { fetchPlaylistById } = require("../src/api/spotify-playlists");

function encodeBasicAuth(clientId, clientSecret) {
  return Buffer.from(clientId + ":" + clientSecret, "utf8").toString("base64");
}

function generateAccessToken() {
  var clientId = process.env.SPOTIFY_CLIENT_ID;
  var clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return Promise.reject(
      new Error(
        "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local"
      )
    );
  }
  var base64AuthString = encodeBasicAuth(clientId, clientSecret);
  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + base64AuthString,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.error) {
        console.error("Error fetching access token:", data.error);
        throw new Error("Error fetching access token: " + data.error.message);
      }
      return data.access_token;
    });
}

var playlistId = "2IgPkhcHbgQ4s4PdCxljAx";

generateAccessToken()
  .then((token) => {
    fetchPlaylistById(token, playlistId)
      .then((data) => {
        // extract track names and artist names
        const tracks = (data.playlist && Array.isArray(data.playlist.tracks.items))
          ? data.playlist.tracks.items.map((item) => {
              const track = item.track ?? item;
              return {
                trackName: track?.name ?? 'Unknown',
                artistNames: Array.isArray(track?.artists) ? track.artists.map((artist) => artist.name ?? artist.id ?? 'Unknown').join(", ") : '',
              };
            })
          : [];

        console.log(
          `Playlist: ${data.playlist?.name ?? 'Unknown'} by ${data.playlist?.owner?.display_name ?? 'Unknown'}`
        );
        console.table(tracks);

        // compute artist counts
        const counts = {};
        if (data.playlist && Array.isArray(data.playlist.tracks.items)) {
          for (const item of data.playlist.tracks.items) {
            const track = item.track ?? item;
            if (!track || !Array.isArray(track.artists)) continue;
            for (const artist of track.artists) {
              const name = artist?.name ?? artist?.id ?? 'Unknown';
              counts[name] = (counts[name] || 0) + 1;
            }
          }
        }

        const countsTable = Object.entries(counts).map(([artist, count]) => ({ artist, count }));
        if (countsTable.length) {
          console.log("Artist counts:");
          console.table(countsTable);
        } else {
          console.log("No artist counts available.");
        }
      })
      .catch((error) => {
        console.error("Error fetching playlist:", error);
      });
  })
  .catch((error) => {
    console.error("Error in Spotify API sandbox:", error);
  });
