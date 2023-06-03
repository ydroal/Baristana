// HTTPリクエストに応答してデータベース操作（レコードの作成、読み込み、更新、削除など）を実行するモジュール
const express = require('express');
// ルーター機能を導入
const router = express.Router();
const connection = require('./db');


// /apiエンドポイントを作成（'/api'とすると/api/apiになる）
router.get('/', (req, res) => {
  res.send('Hello from API');
});

router.get('/bgm/:category', (req, res) => {
  // カテゴリをURLパラメータから取得
  const category = req.params.category;  
  // BGMのURLを取得するSQLクエリ
  const query = "SELECT file_url FROM bgm WHERE file_url LIKE CONCAT('%', ?, '%')";
    

  connection.query(query, category, (error, results) => {
    console.log('query:', query);
    console.log('category:', category);
    console.log('results:', results);
    if (error) {
      // エラー処理
      res.status(500).send('An error occurred while fetching the BGM URL.');
    } else {
      s3_bucket_name = "baristana"
      s3_region = "eu-west-3"
      // クエリ結果のすべてのURLを抽出し、レスポンスとして送信
      const urls = results.map(result => {
        const obj_key = result.file_url;
        const file_url = `https://${s3_bucket_name}.s3.${s3_region}.amazonaws.com/${obj_key}`;
        return file_url;
      });
      // urlsというプロパティ名でurls配列を持つJSONオブジェクトをレスポンスボディとして返す
      res.json({ urls });
    };
});
});

router.post('/chat/messages', (req, res) => {
  // Sends a chat message and stores it in the database
});

router.post('/auth/login', (req, res) => {
  // Authenticate the user by their login information
});

router.get('/auth/user', (req, res) => {
  // Retrieves information for the currently logged-in user
});

router.get('/chat/active_users', (req, res) => {
  // GET: Obtain the current active user (logged-in user) count
});

router.get('/auth/google', (req, res) => {
  // POST: Authenticates the user with their Google account
});


module.exports = router;
