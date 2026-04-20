const jwt = require('jsonwebtoken');
const verifyToken = require('../verifyToken');

const SECRET = process.env.JWT_SECRET;

function makeReqRes(token) {
  const req = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('verifyToken middleware', () => {
  test('トークンなし → 403', () => {
    const { req, res, next } = makeReqRes(null);
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('無効トークン → 401', () => {
    const { req, res, next } = makeReqRes('invalid.token.here');
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('有効トークン → req.user にユーザー情報がセットされ next() が呼ばれる', done => {
    const token = jwt.sign({ id: 1 }, SECRET);
    const { req, res, next } = makeReqRes(token);
    next.mockImplementation(() => {
      expect(req.user).toMatchObject({ id: 1 });
      expect(res.status).not.toHaveBeenCalled();
      done();
    });
    verifyToken(req, res, next);
  });
});
