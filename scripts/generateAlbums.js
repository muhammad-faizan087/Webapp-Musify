// scripts/generateAlbums.js
const fs = require("fs");
const path = require("path");

const songsPath = path.join(__dirname, "../public/songs");
const output = [];

const folders = fs
  .readdirSync(songsPath, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

folders.forEach((folder) => {
  const infoPath = path.join(songsPath, folder, "info.json");
  if (fs.existsSync(infoPath)) {
    const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
    output.push({
      folder,
      title: info.title || "Untitled Album",
      description: info.description || "No description",
    });
  }
});

const outputPath = path.join(songsPath, "albums.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log("✅ albums.json generated.");
