const express = require('express');
const pornhub = require('@justalk/pornhub-api');
const bodyParser = require('body-parser');
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

app.get('/api/video', (req, res) => {
    // Extract viewkey using regex
    const url = req.query.video;
    const regex = /viewkey=([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    const viewkey = match ? match[1] : null;

    if (!viewkey) {
        return res.status(400).json({ error: 'Invalid video URL' });
    }

    // Simulate processing
    // In a real scenario, you'd probably fetch data or perform some logic here
    const responseData = {
        author: "Berwin",
        key: viewkey,
        host: "pornhub.com",
        url: `https://www.pornhub.com/embed/${viewkey}`,
        video: `https://www.pornhub.com/view_video.php?viewkey=${viewkey}`
    };

    // Simulate delay (optional)
    setTimeout(() => {
        res.status(200).json(responseData);
    }, 2000); // 2 seconds delay
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
