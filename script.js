const API_KEY = "AIzaSyAGIJpkJ2Q0OEgZcOIA-nDnDYsOqYNWygA";
const VIDEO_IDS_INPUT = document.getElementById("video-ids");
const START_SCRIPT = document.getElementById("start-script");

function fetchVideoData(VIDEO_ID) {
  const API_URL = `https://www.googleapis.com/youtube/v3/videos?id=${VIDEO_ID}&part=snippet,statistics,contentDetails&key=${API_KEY}`;

  return new Promise((resolve, reject) => {
    $.getJSON(API_URL, (data) => {
      if (data.items && data.items.length > 0) {
        resolve(data.items[0]);
      } else {
        reject("Video not found");
      }
    });
  });
}

function createXLSX(videoDataList) {
  const ws_name = "YouTube Video Data";
  const wb = XLSX.utils.book_new();
  let ws_data = [];

  videoDataList.forEach((videoData, index) => {
    const publishedAt = videoData.snippet.publishedAt;
    const dateObj = new Date(publishedAt);
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const formattedTime = dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
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
    
    const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const data = [
      ["Video ID", videoData.id],
      ["Title", videoData.snippet.title],
      ["Description", videoData.snippet.description],
      ["Channel ID", videoData.snippet.channelId],
      ["Channel Title", videoData.snippet.channelTitle],
      ["Published At", formattedDate + " " + formattedTime],
      ["Duration", formattedDuration],
      ["View Count", videoData.statistics.viewCount],
    ];

    ws_data.push(...data);

    // Ajouter une ligne vide entre chaque vidéo, sauf pour la dernière
    if (index < videoDataList.length - 1) {
      ws_data.push([]);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  XLSX.writeFile(wb, `youtube-videos-data.xlsx`);
}

START_SCRIPT.addEventListener("click", () => {
  const videoIds = VIDEO_IDS_INPUT.value.split(" ");
  const videoDataPromises = videoIds.map((videoId) => fetchVideoData(videoId));

  Promise.all(videoDataPromises)
    .then((videoDataList) => {
      createXLSX(videoDataList);
    })
    .catch((error) => {
      console.error(error);
    });
});
