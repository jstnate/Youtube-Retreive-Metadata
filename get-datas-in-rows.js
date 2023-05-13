const API_KEY = "AIzaSyAGIJpkJ2Q0OEgZcOIA-nDnDYsOqYNWygA";
const VIDEO_IDS_INPUT = document.getElementById("video-ids");
const START_SCRIPT = document.getElementById("start-script");

const PASSWORD = "ViveLaSacem+1851";
const PASSWORD_INPUT = document.getElementById("password");
const CHECK_PASSWORD = document.getElementById("submit-password");

const passwordBox = document.getElementById("password-box");
const mainBox = document.getElementById("main-box");
const errorBox = document.getElementById("error-box");

function fetchVideoData(VIDEO_ID) {
  const API_URL = `https://www.googleapis.com/youtube/v3/videos?id=${VIDEO_ID}&part=snippet,statistics,contentDetails&key=${API_KEY}`;

  return new Promise((resolve, reject) => {
    $.getJSON(API_URL, (data) => {
      if (data.items && data.items.length > 0) {
        resolve(data.items[0]);
      } else {
        reject(`Video not found ${VIDEO_ID}`);
      }
    });
  });
}

function createXLSX(videoDataList) {
  const ws_name = "YouTube Video Data";
  const wb = XLSX.utils.book_new();
  let ws_data = [];

  const header = [
    "Video ID",
    "Title",
    "Description",
    "Channel ID",
    "Channel Title",
    "Published At",
    "Duration",
    "View Count",
  ];
  ws_data.push(header);

  videoDataList.forEach((videoData, index) => {
    const publishedAt = videoData.snippet.publishedAt;
    const dateObj = new Date(publishedAt);
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const duration = videoData.contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (match) {
      if (match[1]) {
        hours = parseInt(match[1].slice(0, -1));
      }
      if (match[2]) {
        minutes = parseInt(match[2].slice(0, -1));
      }
      if (match[3]) {
        seconds = parseInt(match[3].slice(0, -1));
      }
    }

    const formattedDuration = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const data = [
      videoData.id,
      videoData.snippet.title,
      videoData.snippet.description,
      videoData.snippet.channelId,
      videoData.snippet.channelTitle,
      formattedDate + " " + formattedTime,
      formattedDuration,
      videoData.statistics.viewCount,
    ];

    ws_data.push(data);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  ws["!cols"] = header.map(() => ({ 
    width: 20, 
  }));

  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  XLSX.writeFile(wb, `youtube-videos-data.xlsx`);
}

function checkPassword(input) {
  if (input === PASSWORD) {
    passwordBox.style.display = "none";
    mainBox.style.display = "flex";
  } else {
    errorBox.style.display = "block";
  }
}

CHECK_PASSWORD.addEventListener("click", () =>
  checkPassword(PASSWORD_INPUT.value)
);

START_SCRIPT.addEventListener("click", () => {
  if (PASSWORD_INPUT.value === PASSWORD) {
    const videoIds = VIDEO_IDS_INPUT.value.split(" ");
    const videoDataPromises = videoIds.map((videoId) =>
      fetchVideoData(videoId)
    );

    Promise.all(videoDataPromises)
      .then((videoDataList) => {
        createXLSX(videoDataList);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    passwordBox.style.display = "flex";
    mainBox.style.display = "none";
  }
});
