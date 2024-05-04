const express = require('express');
const pornhub = require('@justalk/pornhub-api');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/web' + '/index.html')
});

app.use(bodyParser.json());

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
    const url = req.query.url; // Kunin ang URL mula sa query parameters
    
    try {
        const headers = {
            'Accept': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://www.download4.cc/pornhub-video-downloader.html'
        };

        const response = await axios.get(`https://www.download4.cc/media/parse?address=${url}`, {
            headers: headers
        });

        const link1 = response.data.data.formats[1].url;
        const link2 = response.data.data.formats[4].url;
        const link3 = response.data.data.formats[7].url;
        const title = response.data.data.title;
        const photo = response.data.data.thumbnail;     
        
        res.json({ Title: title, Photo: photo, Url: { 240: link1, 480: link2, 720: link3 } });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
