// Expressアプリケーションを作成(ここがエントリーポイント)
// Expressサーバーを稼働させる

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
require('dotenv').config();
const cookieParser = require('cookie-parser');


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

// 3000ポートでlisten
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


