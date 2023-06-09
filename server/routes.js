// HTTPリクエストに応答してデータベース操作（レコードの作成、読み込み、更新、削除など）を実行するモジュール
const express = require('express');
// ルーター機能を導入
const router = express.Router();
const connection = require('./db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
// verifyToken ミドルウェアのインポート
const verifyToken = require('./verifyToken');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const secretKey = process.env.JWT_SECRET;

// /apiエンドポイントを作成（'/api'とすると/api/apiになる）
router.get('/', (req, res) => {
  res.send('Hello from API');
});

// セッションにユーザー情報を保存
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   // データベースからユーザーを検索
//   const query = 'SELECT * FROM user WHERE google_id = ?';
//   connection.query(query, id, (err, results) => {
//     if (err) {
//       return done(err);
//     }
//     if (!results.length) {
//       return done(null, false);
//     }
//     return done(null, results[0]);
//   });
// });


// passportとStrategyの紐づけ
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: 'http://localhost:3000/api/auth/google/callback',
// }, function(accessToken, refreshToken, profile, done) {
//   process.nextTick(function() {
//     // SQLクエリを作成　受け取ったユーザープロフィールデータをuserテーブルに挿入
//     const query = 'INSERT INTO user (google_id, username, email, access_token, refresh_token, created_at) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE access_token = ?, username = ?, email = ?, refresh_token = ?';
//     // paramsはSQLクエリに渡すパラメータの配列。クエリ内の?が置換される
//     const params = [
//       profile.id,
//       profile.displayName,
//       profile.emails[0].value,
//       accessToken,
//       refreshToken,
//       accessToken,
//       profile.displayName,
//       profile.emails[0].value,
//       refreshToken
//     ];
    
//     // SQLクエリを実行
//     connection.query(query, params, function(error, results) {
//       if (error) {
//         return done(error);
//       }
//       const user = results[0];
//       return done(null, user);
//     });
//   });
// }));
    

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
      let s3_bucket_name = process.env.BUCKET_NAME;
      let s3_region = process.env.S3_REGION;
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

router.get('/chat/active_users', (req, res) => {
  // GET: Obtain the current active user (logged-in user) count
});

// ユーザーをGoogleのログインページにリダイレクトする
// router.get('/auth/google', passport.authenticate('google', {
  //   scope: ['profile', 'email']
  // }));
  
  // Googleから認証コードを受け取り、その認証コードを用いてアクセストークンを取得する
  // router.get('/auth/google/callback', passport.authenticate('google', {
    //   successRedirect: 'http://localhost:5173', //ログイン成功時のリダイレクト先
    //   failureRedirect: 'http://localhost:5173' // // ログイン失敗時のリダイレクト先
    // }));
    
const client = new OAuth2Client(CLIENT_ID);  // Google API Consoleで取得したクライアントID
    
// フロントエンドからのIDトークンを受け取る
router.post('/auth/google/onetap', async (req, res) => {
  const idToken = req.body.idToken;
  console.log('Received ID token:', idToken);
  // IDトークンを検証し、検証が成功したらユーザーを認証する処理
  try {
    const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
    });
    // 他にもpayloadには、ユーザーの名前やメールアドレスなどが含まれます
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const username = payload['name'];
    const email = payload['email'];
    const accessToken = payload['at_hash'];
    const refreshToken = payload['rt_hash'];
    
    // ユーザーの一意性を確認し、新規ユーザーであればDBにレコードを作成、既存ユーザーであればレコードを更新
    const query = `
    INSERT INTO user (google_id, username, email, created_at, access_token, refresh_token) 
    VALUES (?, ?, ?, NOW(), ?, ?)
    ON DUPLICATE KEY UPDATE username = ?, email = ?, access_token = ?, refresh_token = ?;
    `;
    const params = [userid, username, email, accessToken, refreshToken, username, email, accessToken, refreshToken];
    
    connection.query(query, params, function(error, results) {
      if (error) {
        console.error(error);
        res.sendStatus(500); // サーバーエラーを示すHTTPステータスコード
      } else {
        // JWT トークンを発行
        const jwtToken = issueToken(userid);
        // トークンをレスポンスとして送信
        res.json({ token: jwtToken });
        
        // データベースの操作が成功した後でセッションにユーザー情報を保存する
        //     req.login({ id: userid, username: username }, (err) => {
          //       if (err) {
            //         console.error(err);
            //         res.sendStatus(500);
            //       } else {
              //         res.sendStatus(200);// OKレスポンスを返す
              //       }
              // });
            }
          });
        } catch (e) {
          // IDトークンの検証に失敗したら、エラーレスポンスを返す
          console.error(e);
          res.sendStatus(400);
        }
      });
      
      // JWTの発行
      function issueToken(userId) {
        const payload = { id: userId };
        return jwt.sign(payload, secretKey, { expiresIn: '1d' }); // 有効期限を1日とする
      }

      router.get('/auth/user', verifyToken, (req, res) => {
        if (req.user) { // ユーザーがログインしている場合
          res.json(req.user); // ログインユーザーの情報を返す
        } else { // ユーザーがログインしていない場合
          res.status(401).json({ message: 'No user is logged in' }); // エラーメッセージを返す
        }
      });

      // // ログアウト
      // router.get('/auth/logout', (req, res) => {
        //   req.logout();  // Passport.js の機能
        //   res.sendStatus(200);  // ログアウト成功を返す
        // });
        
        // ログアウト（公式からコピーしたコード。POST＆コールバックが必要？）
        router.post('/auth/logout', function(req, res, next) {
          req.logout(function(err) {
    if (err) { 
      return next(err); 
    }
    res.sendStatus(200);
  });
});


module.exports = router;

