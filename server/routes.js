// HTTPリクエストに応答してデータベース操作（レコードの作成、読み込み、更新、削除など）を実行するモジュール

const express = require('express');
// ルーター機能を導入
const router = express.Router();
const connection = require('./db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// OAuth2.0の認証を通す
const { OAuth2Client } = require('google-auth-library');
// JWTの作成・検証用library
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

// ユーザーをGoogleのログインページにリダイレクトする（不要）
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

  try {
    // IDトークンを検証し、検証が成功したらユーザーを認証する処理
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    // payloadには、ユーザーの名前やメールアドレスなどが含まれる
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
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
    const params = [googleId, username, email, accessToken, refreshToken, username, email, accessToken, refreshToken];

    // connection.queryをPromiseでラップする
    await new Promise((resolve, reject) => {
      connection.query(query, params, function (error, results) {
        if (error) {
          console.error(error);
          reject(error);
          return;
        }
        resolve(results);
      });
    });

    // userテーブルからidを取得
    const userId = await getUserId(googleId);

    // JWT トークンを発行
    const jwtToken = issueToken(userId);

    // トークンをレスポンスとして送信
    res.json({ token: jwtToken });

    // active_userテーブルにもレコードを挿入
    const activeUserQuery = `
    INSERT INTO active_user (user_id, last_activity, chat_enabled)
    VALUES (?, NOW(), false)
    ON DUPLICATE KEY UPDATE last_activity = NOW();
    `;

    //をPromiseでラップする
    await new Promise((resolve, reject) => {
      connection.query(activeUserQuery, [userId], function (error, results) {
        if (error) {
          console.error(error);
          reject(error); // promiseをerrorでrejectする
          return;
        }
        resolve(results); // promiseをresultsでresolveする
      });
    });
  } catch (e) {
    // IDトークンの検証に失敗したら、エラーレスポンスを返す
    console.error(e);
    res.sendStatus(400);
    }
});

// JWTトークンの発行
function issueToken(userId) {
const payload = { id: userId };
return jwt.sign(payload, secretKey, { expiresIn: '1d' }); // 有効期限を1日とする
}

// userテーブルからユーザーのidを取得する
async function getUserId(googleId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM user WHERE google_id = ?';
    connection.query(query, [googleId], function (error, results) {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].id);
      }
    });
  });
}

router.get('/auth/user', verifyToken, (req, res) => {
  if (req.user) { // ユーザーがログインしている場合
    res.json(req.user); // ログインユーザーの情報(userIDのみ)を返す
  } else { // ユーザーがログインしていない場合
    res.status(401).json({ message: 'No user is logged in' }); // エラーメッセージを返す
  }
});

// ログアウト（公式からコピーしたコード。POST＆コールバックが必要？）
// router.post('/auth/logout', function(req, res, next) {
//   req.logout(function(err) {
//     if (err) { 
//       return next(err); 
//     }
//     res.sendStatus(200);
//   });
// });

// 新ログアウト
router.post('/auth/logout', verifyToken, (req, res, next) => {
  // req.user には verifyTokenミドルウェアにより認証されたユーザー情報が格納されている
  const userId = req.user.id;

  // userIdを使ってactive_userテーブルから該当レコードを削除
  const query = `DELETE FROM active_user WHERE user_id = ?`;
  connection.query(query, [userId], function (error, results, fields) {
    if (error) throw error;
    // レコードの削除が成功したらHTTP 200を返す
    console.log('レコード削除したよ');
    res.sendStatus(200);
  });
});

// chat_enabledの値をトグルする
router.put('/active_user/:id/chat_enabled', verifyToken, (req, res) => {
  const userId = req.params.id;  // データベースのユーザーIDを取得
  const chatEnabled = req.body.chat_enabled;

  // userIdが存在するか確認は省略。存在しない場合はUPDATE文が何も影響を与えず、エラーは発生しない。
  const sql = 'UPDATE active_user SET chat_enabled = ? WHERE user_id = ?';
  connection.query(sql, [chatEnabled, userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send({message: 'Database update failed.'});
    }
    res.send({message: 'Chat status updated successfully.'});
  });
});

// ユーザー情報取得(user-settingページ用）エンドポイント
router.get('/user/:id', verifyToken, async (req, res) => {
  try {
    const query = `SELECT username, email, profile_picture_url FROM user WHERE id = ?`;
    connection.query(query, [req.params.id], (err, results) => {
      if (err) {
        console.log(err); 
        return res.status(500).json({ message: 'Error in Fetching user' });
      }
      res.json(results);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' }); 
  }
});

// ユーザー情報更新エンドポイント
router.put('/user/:userId', (req, res) => {
  const query = `UPDATE user SET username = ?, profile_picture_url = ? WHERE id = ?`;
  let params = [req.body.username, req.body.profile_picture_url, req.params.userId];
  connection.query(query, params, (err, result) => {
    if (err) throw err;
    res.send('User updated successfully');
  });
});

module.exports = router;
