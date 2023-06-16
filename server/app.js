// Expressアプリケーションを作成(ここがエントリーポイント)
// Expressサーバーを稼働させる

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const http = require('http'); 
const socketIo = require('socket.io');
const connection = require('./db');
// const fs = require('fs');  // file送信用に新しく追加
// const path = require('path'); // file送信用に新しく追加


// Expressモジュールを実体化して、定数appに代入
const app = express();

// JSONデータのパースを有効にする
app.use(express.json());  

const port = 3000;

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET_KEY, //暗号化に利用するキーを設定
  resave: false, //毎回セッションを作成しない
  saveUninitialized: false, //未初期化状態のセッションを保存しない
  cookie: {
    httpOnly: true, // HttpOnly属性を有効にし、JavaScriptからのアクセスを防ぐ
    secure: false, // ローカル開発環境では false, 本番環境では true に設定
    path: '/', // クッキーが有効であるパスを指定する
    maxAge: 1000 * 60 * 60 // クッキーの有効期限を1時間に設定
  }
}));

app.use(cors());
// app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

// クッキーデバッグ用
app.use(function(req, res, next) {
  console.log('Cookies: ', req.cookies);
  next();
});

app.use(passport.session());

//'/'パスにGET要求があった際に実行する処理
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// エンドポイントのマウント
app.use('/api', routes);

// ここでhttp.Serverのインスタンスを作成し、その上にsocket.ioをセットアップ
const server = http.createServer(app); // HTTP serverを作成
// Socket.IO serverをHTTP serverに接続。
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
}); 
// 全ての接続中のユーザーのユーザーIDを格納するためのオブジェクト
const socketToUserId = {}; 
// アクティブなユーザー情報を保持する配列
let activeUsers = [];

// このインスタンス(io)はサーバーとしてlistenするオブジェクトとなる
io.on('connection', (socket) => {
  console.log('a user connected');

  // ユーザーが参加したとき
  socket.on('user joined', (userId) => {
    // ユーザー情報をデータベースから取得
    console.log('user joined発火');
    const userQuery = 'SELECT username FROM user WHERE id = ?';
    connection.query(userQuery, [userId], function(err, results, fields) {
      if (err) throw err;
      if (results.length === 0) {
        console.log('No user found with id', userId);
        return;
      }
      const userName = results[0].username;
      console.log(userName);
      // そのユーザーがすでにactiveUsersリストに存在するかどうかを確認
      const isUserActive = activeUsers.some(user => user.userId === userId);

      // ユーザーがactiveUsersリストに存在しない場合、リストに追加
      if (!isUserActive) {
        activeUsers.push({userId, userName});
        console.log('activeUser is created');
        io.emit('active users update', activeUsers);
      }
    });
  });
  
  // クライアントが初めて接続したときにloginイベントを発生させ、userIDを送信
  socket.on('login', (userId) => {
    socketToUserId[socket.id] = userId; // ユーザーIDをsocket.idと紐づけて保存
  });

  // メッセージを受け取るためのイベントリスナーを設定
  socket.on('chat message', (msg) => {
    const userId = socketToUserId[socket.id];
    if (userId) {
      // ここでデータベースにメッセージを保存
      const query = 'INSERT INTO chat_message (message, user_id, created_at) VALUES (?, ?, NOW())';
      connection.query(query, [msg, userId], function(err, results, fields) {
        if (err) throw err;
        console.log('Message saved to database');
        // ユーザー情報を取得
        const userQuery = 'SELECT username, profile_picture_url FROM user WHERE id = ?';
        connection.query(userQuery, [userId], function(err, results, fields) {
          if (err) throw err;
          const username = results[0].username;
          const usericon = results[0].profile_picture_url;

          // メッセージ、ユーザー名、ユーザーアイコンを含むオブジェクトを作成
          const messageObj = {
            msg: msg,
            username: username,
            usericon: usericon,
            userId: userId 
          };
        
          // メッセージをすべての接続しているクライアントにブロードキャスト
          io.emit('chat message', messageObj);
        });
      });
    } else {
      console.error('Unknown user');
    }
  });

  socket.on('disconnect', () => {
    // ユーザーが切断したときにactiveUsersリストから削除
    activeUsers = activeUsers.filter(user => user.userId !== socketToUserId[socket.id]);

    // ユーザーデータの更新を通知
    io.emit('active users update', activeUsers);
    
    delete socketToUserId[socket.id];
    console.log('user disconnected');
  });
});

// 3000ポートでlisten
// app.listen から server.listen への変更
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


