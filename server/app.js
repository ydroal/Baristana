const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const http = require("http");
const socketIo = require("socket.io");
const connection = require("./db");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
// Expressモジュールを実体化して、定数appに代入
const app = express();

// JSONデータのパースを有効にする
app.use(express.json());

const port = 3000;

app.use(cors());

// エンドポイントのマウント
app.use("/api", routes);

// ここでhttp.Serverのインスタンスを作成し、その上にsocket.ioをセットアップ
const server = http.createServer(app); // HTTP serverを作成
// Socket.IO serverをHTTP serverに接続。
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
// アクティブなユーザー情報を保持する配列
let activeUsers = [];

// JWT認証ミドルウェア
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized"));
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return next(new Error("Unauthorized"));
    socket.data.userId = user.id;
    next();
  });
});

// このインスタンス(io)はサーバーとしてlistenするオブジェクトとなる
io.on("connection", (socket) => {
  // ユーザーが参加したとき
  socket.on("user joined", () => {
    const userId = socket.data.userId;
    // ユーザー情報をデータベースから取得
    const userQuery = "SELECT username FROM user WHERE id = ?";
    connection.query(userQuery, [userId], function (err, results, fields) {
      if (err) throw err;
      if (results.length === 0) {
        return;
      }
      const userName = results[0].username;
      // そのユーザーがすでにactiveUsersリストに存在するかどうかを確認
      const isUserActive = activeUsers.some((user) => user.userId === userId);

      // ユーザーがactiveUsersリストに存在しない場合、リストに追加
      if (!isUserActive) {
        activeUsers.push({ userId, userName });
        io.emit("active users update", activeUsers);
      }
    });
  });

  // メッセージを受け取るためのイベントリスナーを設定
  socket.on("chat message", (msg) => {
    const now = Date.now();
    if (now - (socket.data.lastMessageAt || 0) < 1000) {
      socket.disconnect();
      return;
    }
    socket.data.lastMessageAt = now;
    const userId = socket.data.userId;
    if (userId) {
      // ここでデータベースにメッセージを保存
      const query =
        "INSERT INTO chat_message (message, user_id, created_at) VALUES (?, ?, NOW())";
      connection.query(query, [msg, userId], function (err, results, fields) {
        if (err) throw err;
        // ユーザー情報を取得
        const userQuery =
          "SELECT username, profile_picture_url FROM user WHERE id = ?";
        connection.query(userQuery, [userId], function (err, results, fields) {
          if (err) throw err;
          const username = results[0].username;
          const usericon = results[0].profile_picture_url;

          // メッセージ、ユーザー名、ユーザーアイコンを含むオブジェクトを作成
          const messageObj = {
            msg: msg,
            username: username,
            usericon: usericon,
            userId: userId,
          };

          // メッセージをすべての接続しているクライアントにブロードキャスト
          io.emit("chat message", messageObj);
        });
      });
    } else {
      console.error("Unknown user");
    }
  });

  // 添付ファイルを受け取るためのイベントリスナーを設定
  const MAX_FILE_SIZE = 3; // MB
  socket.on("uploaded file", (file) => {
    const now = Date.now();
    if (now - (socket.data.lastMessageAt || 0) < 1000) {
      socket.disconnect();
      return;
    }
    socket.data.lastMessageAt = now;
      const fileSize = file.byteLength / 1024 ** 2;
    if (fileSize > MAX_FILE_SIZE) {
      console.error("File is too large");
      socket.emit("upload error", {
        message:
          `File is too large. Maximum allowed size is ${MAX_FILE_SIZE} MB`,
      }); //ファイル送信者にのみ送信
      return;
    }

    const userId = socket.data.userId;
    if (userId) {
      const query =
        "SELECT username, profile_picture_url FROM user WHERE id = ?";
      connection.query(query, [userId], function (err, results, fields) {
        if (err) throw err;
        const username = results[0].username;
        const usericon = results[0].profile_picture_url;

        // メッセージ、ユーザー名、ユーザーアイコンを含むオブジェクトを作成
        const fileObj = {
          file: file,
          username: username,
          usericon: usericon,
          userId: userId,
        };
        io.emit("chat file", fileObj);
      });
    } else {
      console.error("Unknown user");
    }
  });

  socket.on("disconnect", () => {
    // ユーザーが切断したときにactiveUsersリストから削除
    activeUsers = activeUsers.filter(
      (user) => user.userId !== socket.data.userId,
    );

    // ユーザーデータの更新を通知
    io.emit("active users update", activeUsers);
  });
});

// 3000ポートでlisten
// app.listen から server.listen への変更
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
