console.log("Executing js");

let currentSong = new Audio();
let songs_ = [];
let currentFolder = null;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function getBaseUrl() {
  return `${window.location.origin}`;
}

function playSong(track, paused = false) {
  if (!track) {
    console.error("Track is undefined. Cannot play.");
    return;
  }
  currentSong.src = `${getBaseUrl()}/${currentFolder}/${track}`;
  if (!paused) {
    currentSong.play();
    document.querySelector("#play-button").src = "images/pause-icon.svg";
  }
  document.querySelector(".songName").innerHTML = track;

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songDuration").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
}

async function getSongs(folder) {
  currentFolder = folder;
  try {
    let data = await fetch(`${getBaseUrl()}/${currentFolder}/`);
    let parsed_data = await data.text();
    let div = document.createElement("div");
    div.innerHTML = parsed_data;
    let anchors = div.getElementsByTagName("a");
    songs_ = [];
    for (const a of anchors) {
      if (a.href.endsWith(".mp3")) {
        songs_.push(decodeURIComponent(a.href.split(`/${currentFolder}/`)[1]));
      }
    }

    let ul = document.querySelector(".songsList");
    ul.innerHTML = "";
    for (const song of songs_) {
      ul.innerHTML += `
        <li class="songItem flex align-center">
          <img src="images/musify logo.png" alt="" class="svg" />
          <div class="song-info">
            <div>${song}</div>
          </div>
          <div class="playnow">Play Now</div>
        </li>`;
    }

    let tracks = document
      .querySelector(".songsList")
      .getElementsByTagName("li");
    for (const track of tracks) {
      track.addEventListener("click", () => {
        playSong(
          track.querySelector(".song-info").firstElementChild.textContent
        );
      });
    }
    return songs_;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

async function displayAlbums() {
  try {
    let data = await fetch(`${getBaseUrl()}/songs/`);
    let parsed_data = await data.text();
    let div = document.createElement("div");
    div.innerHTML = parsed_data;
    let anchors = div.getElementsByTagName("a");
    let allAlbums = document.querySelector(".all-albums");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
      const a = array[index];
      if (a.href.includes("/songs/") && !a.href.includes(".htaccess")) {
        let folder = a.href.split("/").slice(-1)[0];
        let albumData = await fetch(
          `${getBaseUrl()}/songs/${folder}/info.json`
        );
        let parsed_albumData = await albumData.json();
        allAlbums.innerHTML += `
          <li data-folder="${folder}" class="album">
            <img src="songs/${folder}/cover.jpg" alt="Album pic" />
            <div class="play-icon flex align-center">
              <img src="images/play-icon.svg" alt="play icon" />
            </div>
            <div class="album-info">
              <a href="#" class="album-name">${parsed_albumData.title}</a>
              <div class="artists">
                <a href="#">${parsed_albumData.description}</a>
              </div>
            </div>
          </li>`;
      }
    }

    let albums = document.getElementsByClassName("album");
    Array.from(albums).forEach((element) => {
      element.addEventListener("click", async (item) => {
        await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playSong(songs_[0]);
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

async function main() {
  await displayAlbums();
  let playbutton = document.querySelector("#play-button");
  playbutton.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      playbutton.src = "images/pause-icon.svg";
    } else {
      currentSong.pause();
      playbutton.src = "images/playbar-icon.svg";
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (percent * currentSong.duration) / 100;
  });

  let profile = document.querySelector(".profile-img");
  profile.addEventListener("click", (event) => {
    event.stopPropagation();
    const profileDropdown = document.querySelector(".dropdown");
    if (!profileDropdown) {
      document.querySelector(".profile").innerHTML += `
          <div class="dropdown flex align-center justify-between">
            <button class="logout">Logout</button>
            <img src="images/logout.svg" alt="logout icon" class='logout-svg'/>
          </div>`;
    }
    const dropdown = document.querySelector(".dropdown");
    document.addEventListener("click", () => {
      if (dropdown.style.display !== "none") {
        dropdown.style.display = "none";
      }
    });

    // const logoutButton = document.querySelector(".logout");
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = "index.html";
    });
  });

  let leftCont = document.querySelector(".left-container");
  let close = document.querySelector(".close");

  close.addEventListener("click", () => {
    leftCont.style.left = "-100%";
    close.style.display = "none";
  });

  let hamburger = document.querySelector(".hamburger");
  hamburger.addEventListener("click", (e) => {
    close.style.display = "block";
    e.stopPropagation();
    leftCont.style.left = "0";
    leftCont.style.boxShadow = "#000000e0 15px 0px 15px";
    leftCont.style.width = "70%";
    let songInfos = document.getElementsByClassName("song-info");
    Array.from(songInfos).forEach((element) => {
      element.style.width = "30vw";
    });
  });

  let previous = document.querySelector("#previous");
  previous.addEventListener("click", () => {
    let currentTrackIndex = songs_.indexOf(
      decodeURIComponent(currentSong.src.split(`${currentFolder}/`)[1])
    );
    if (currentTrackIndex > 0) {
      playSong(songs_[currentTrackIndex - 1]);
    }
  });

  let next = document.querySelector("#next");
  next.addEventListener("click", () => {
    let currentTrackIndex = songs_.indexOf(
      decodeURIComponent(currentSong.src.split(`${currentFolder}/`)[1])
    );
    if (currentTrackIndex < songs_.length - 1) {
      playSong(songs_[currentTrackIndex + 1]);
    }
  });

  document.querySelector("#volume-seekbar").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  document.querySelector(".volume-btn").addEventListener("click", (e) => {
    if (e.target.src.includes("images/volume.svg")) {
      e.target.src = e.target.src.replace(
        "images/volume.svg",
        "images/mute.svg"
      );
      currentSong.volume = 0;
      document.querySelector("#volume-seekbar").value = 0;
    } else if (e.target.src.includes("images/mute.svg")) {
      e.target.src = e.target.src.replace(
        "images/mute.svg",
        "images/volume.svg"
      );
      currentSong.volume = 0.1;
      document.querySelector("#volume-seekbar").value = 10;
    }
  });

  document.querySelector(".home_icon").addEventListener("click", () => {
    let ul = document.querySelector(".songsList");
    ul.innerHTML = "";
  });
}

main();
