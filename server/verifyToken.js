const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

// JWTの検証
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearerトークンの形式に対応

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }
  jwt.verify(token, secretKey, (err, user) => { // secretKeyは実際のJWT秘密鍵
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).send({ message: 'Failed to authenticate token.' });
    }
    // ユーザー情報をreq.userに保存
    req.user = user;
    next();
  });
};

module.exports = verifyToken;