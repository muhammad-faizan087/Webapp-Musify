// scripts/generateTracks.js

const fs = require("fs");
const path = require("path");

const SONGS_DIR = path.join(__dirname, "..", "public", "songs");

function isAudioFile(file) {
  return [".mp3", ".wav", ".ogg"].includes(path.extname(file).toLowerCase());
}

fs.readdirSync(SONGS_DIR).forEach((album) => {
  const albumPath = path.join(SONGS_DIR, album);

  if (fs.statSync(albumPath).isDirectory()) {
    const files = fs.readdirSync(albumPath);
    const audioFiles = files.filter(isAudioFile);

    const tracksPath = path.join(albumPath, "tracks.json");
    fs.writeFileSync(tracksPath, JSON.stringify(audioFiles, null, 2), "utf-8");

    console.log(`✅ tracks.json created for: ${album}`);
  }
});
