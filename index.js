const express = require('express');
const pornhub = require('@justalk/pornhub-api');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/web' + '/index.html')
});

app.get('/server-runtime', (req, res) => {
    const serverRuntime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    res.send(serverRuntime);
});

app.get("/dash", async (req, res) => {
const uptime = process.uptime();   
  res.json(uptime);
});

app.get('/cronhub', async (req, res) => {
  try {
    const query = req.query.q; // Ang query string para sa paghahanap ay maaaring ipasa bilang `q`
    const links = await pornhub.search(query, ["title", "link", "premium", "hd"]);

    function randomIndex() {
      return Math.floor(Math.random() * links.results.length);
    }

    const randomVideo = links.results[randomIndex()];

    const videoData = {
      title: randomVideo.title,
      link: randomVideo.link,
      author: randomVideo.author
    };

    res.json(videoData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

  app.get('/cronhub/download', async (req, res) => {
    const link = req.query.link;
    try {

  const video = await pornhub.page(link, ['title', 'pornstars', 'download_urls']);

    const final = video;

    res.json(final);

    } catch(error) {
      res.json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});