const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Fungsi untuk memvalidasi URL YouTube
function isYouTubeURL(url) {
  const youtubePattern = /^https?:\/\/(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|e\/|.*\/videoseries\?v=)[a-zA-Z0-9_-]{11}(&.*)?$/;
  return youtubePattern.test(url);
}

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;
  const format = req.query.format || 'mp4';

  if (!videoURL) {
    return res.send('URL is required!');
  }

  // Validasi apakah URL adalah link YouTube
  if (!isYouTubeURL(videoURL)) {
    return res.send('Mohon periksa link yang telah dimasukkan. Pastikan itu adalah link YouTube yang valid.');
  }

  try {
    // Mendapatkan info video dari YouTube
    const info = await ytdl.getInfo(videoURL);
    let videoFormat;
    
    if (format === 'mp3') {
      // Pilih format audio
      videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);
      ytdl(videoURL, { format: videoFormat }).pipe(res);
    } else {
      // Pilih format video
      videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
      res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
      ytdl(videoURL, { format: videoFormat }).pipe(res);
    }

  } catch (error) {
    res.send('Error downloading video: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
