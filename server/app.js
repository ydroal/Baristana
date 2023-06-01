// Expressアプリケーションを作成(ここがエントリーポイント)
// Expressサーバーを稼働させる

const express = require('express');
const routes = require('./routes');
// Expressモジュールを実体化して、定数appに代入
const app = express();
const port = 3000;

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
