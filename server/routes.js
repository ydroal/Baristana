// HTTPリクエストに応答してデータベース操作（レコードの作成、読み込み、更新、削除など）を実行するモジュール
const express = require('express');
// ルーター機能を導入
const router = express.Router();
const connection = require('./db');


// /apiエンドポイントを作成（'/api'とすると/api/apiになる）
router.get('/', (req, res) => {
  res.send('Hello from API');
});

app.get('/bgm/:id', (req, res) => {
  // get the id from the URL parameters
  const id = req.params.id;  
  // SQL query to get the BGM URL
  const query = 'SELECT url FROM bgm WHERE id = ?';  

  db.query(query, id, (error, results) => {
    if (error) {
      // handle error
      res.status(500).send('An error occurred while fetching the BGM URL.');
    } else {
      // send the URL in the response
      res.json({ url: results[0].url });
    }
  });
});

app.post('/chat/messages', (req, res) => {
  // Sends a chat message and stores it in the database
});

app.post('/auth/login', (req, res) => {
  // Authenticate the user by their login information
});

app.get('/auth/user', (req, res) => {
  // Retrieves information for the currently logged-in user
});

app.get('/chat/active_users', (req, res) => {
  // GET: Obtain the current active user (logged-in user) count
});

app.get('/auth/google', (req, res) => {
  // POST: Authenticates the user with their Google account
});


module.exports = router;
