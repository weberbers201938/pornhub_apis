const express = require('express');
const fs = require('fs');
const pornhub = require('@justalk/pornhub-api');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors'); 
app.get('/', async (req, res) => {
  res.sendFile(__dirname + '/web' + '/index.html')
});

app.use(bodyParser.json());
app.use(cors()); 

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

app.get('/dl/pron', async (req, res) => {
  try {
    const url = 'https://api3.p2mate.com/mates/en/analyze/ajax';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      'Referer': req.headers['referer']
    };
    const data = `url=${encodeURIComponent(req.query.url)}`;

    const response = await axios.post(url, data, { headers });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.post('/claude', (req, res) => {
  
  const prompt = req.query.prompt;

  const data = {
    botId: "default",
    customId: "cb8524911960c2a53d904eee296da6bb",
    session: "N/A",
    chatId: "pvdlhpwm6bq",
    contextId: 12,
    messages: [
      {
        id: "1x0pl5i8ylx",
        role: "assistant",
        content: "Hi! How can I help you?",
        who: "AI: ",
        timestamp: 1715033883608
      }
    ],
    newMessage: prompt,
    newFileId: null,
    stream: true
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': '16b638fde7',
    'Accept': 'text/event-stream',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://www.pinoygpt.com/'
  };

  axios.post('https://www.pinoygpt.com/wp-json/mwai-ui/v1/chats/submit', data, { headers })
    .then(response => {
      // Kunin ang reply data mula sa response ng PinoyGPT API
      let replyData = null;
      const messages = response.data.split('\n\n').filter(message => message.startsWith('data:'));

      messages.forEach(message => {
        const jsonData = JSON.parse(message.slice(6));
        if (jsonData.type === 'end') {
          replyData = JSON.parse(jsonData.data);
        }
      });

      // Isauli ang reply data sa endpoint
      res.json(replyData);
    })
    .catch(error => {
      // Kung may error, isasauli ito bilang JSON response kasama ang error message
      res.status(500).json({ error: error.message });
    });
});

app.post('/api/react', async (req, res) => {
    try {
        const { link, type, cookie } = req.query;
        const response = await axios.post("https://flikers.net/android/android_get_react.php", {
            post_id: link,
            react_type: type,
            version: "v1.7"
        }, {
            headers: {
                'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; V2134 Build/SP1A.210812.003)",
                'Connection': "Keep-Alive",
                'Accept-Encoding': "gzip",
                'Content-Type': "application/json",
                'Cookie': cookie
            }
        });

        // Save history entry
        const historyEntry = { link, type };
        saveHistory(historyEntry);

        res.json(response.data.message);
    } catch (error) {
        console.error(error);
        res.json({ error: 'an error occurred' });
    }
});

// API endpoint para sa pag-load ng history
app.get('/api/history', (req, res) => {
    try {
        const history = loadHistory();
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching history.' });
    }
});

// Helper function para sa pag-save sa history
function saveHistory(entry) {
    fs.appendFile('react_history.json', JSON.stringify(entry) + '\n', (err) => {
        if (err) console.error(err);
        console.log('History entry saved successfully!');
    });
}

// Helper function para sa pag-load ng history
function loadHistory() {
    const rawData = fs.readFileSync('react_history.json');
    const history = rawData.toString().split('\n').filter(entry => entry !== '').map(JSON.parse);
    return history;
}
        
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
