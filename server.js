const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const { EventEmitter } = require('events');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static('mychat'));

// Create an EventEmitter for handling chat messages
const chatEmitter = new EventEmitter();

const users = [
  { id: 1, username: 'user1' },
  { id: 2, username: 'user2' },
  // Add more users if needed
];

app.get('/', (req, res) => {
  res.send('hi');
});

app.get('/json', (req, res) => {
  res.json({ text: 'hi', numbers: [1, 2, 3] });
});

app.get('/echo', (req, res) => {
  const input = req.query.input || '';
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    characterCount: input.length,
    backwards: input.split('').reverse().join('')
  });
});

const extractUser = (req, res, next) => {
  const username = req.query.username;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid user.' });
  }

  req.user = user;
  next();
};

app.get('/chat', extractUser, (req, res) => {
  const message = req.query.message || '';
  const username = req.user.username;
  const formattedMessage = `${username}: ${message}`;
  
  chatEmitter.emit('message', formattedMessage);
  res.sendStatus(200);
});

app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', sendMessage);

  req.on('close', () => {
    chatEmitter.off('message', sendMessage);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
