// get the client
const mysql = require('mysql2');


// create the connection to database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'barista',
  password: 'barista555',
  database: 'baristana_db'
});

// 接続切断した際の再接続（既存の接続があれば閉じる）
// if(connection && connection.end) {
//   connection.end();
// }

module.exports = connection;