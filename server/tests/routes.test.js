const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('../db', () => ({ query: jest.fn() }));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PutObjectCommand: jest.fn(),
}));

const db = require('../db');
const router = require('../routes');

const app = express();
app.use(express.json());
app.use('/api', router);

const SECRET = process.env.JWT_SECRET;
const generateToken = (userId) => jwt.sign({ id: userId }, SECRET);

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET /api/auth/user ───────────────────────────────────────────────────────
describe('GET /api/auth/user', () => {
  test('有効JWT → 200 + user情報', done => {
    const token = generateToken(1);
    db.query.mockImplementation((sql, params, cb) => cb(null, [{ id: 1 }]));
    request(app)
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .end(done);
  });

  test('トークンなし → 403', done => {
    request(app).get('/api/auth/user').expect(403).end(done);
  });

  test('無効JWT → 401', done => {
    request(app)
      .get('/api/auth/user')
      .set('Authorization', 'Bearer invalid.token')
      .expect(401)
      .end(done);
  });
});

// ─── PUT /api/active_user/:id/chat_enabled ────────────────────────────────────
describe('PUT /api/active_user/:id/chat_enabled', () => {
  test('トークンなし → 403', done => {
    request(app)
      .put('/api/active_user/1/chat_enabled')
      .send({ chat_enabled: true })
      .expect(403)
      .end(done);
  });

  test('他人のID（IDOR） → 403', done => {
    const token = generateToken(1);
    request(app)
      .put('/api/active_user/999/chat_enabled')
      .set('Authorization', `Bearer ${token}`)
      .send({ chat_enabled: true })
      .expect(403)
      .end(done);
  });

  test('本人のID → 200', done => {
    const token = generateToken(1);
    db.query.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 1 }));
    request(app)
      .put('/api/active_user/1/chat_enabled')
      .set('Authorization', `Bearer ${token}`)
      .send({ chat_enabled: true })
      .expect(200)
      .end(done);
  });
});

// ─── PUT /api/user/:userId（username更新）────────────────────────────────────
describe('PUT /api/user/:userId', () => {
  test('トークンなし → 403', done => {
    request(app)
      .put('/api/user/1')
      .send({ username: 'newname' })
      .expect(403)
      .end(done);
  });

  test('他人のID（IDOR） → 403', done => {
    const token = generateToken(1);
    request(app)
      .put('/api/user/999')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newname' })
      .expect(403)
      .end(done);
  });

  test('本人のID → 200', done => {
    const token = generateToken(1);
    db.query.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 1 }));
    request(app)
      .put('/api/user/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newname' })
      .expect(200)
      .end(done);
  });
});

// ─── PUT /api/user/:userId/icon（アイコン更新）───────────────────────────────
describe('PUT /api/user/:userId/icon', () => {
  test('トークンなし → 403', done => {
    request(app)
      .put('/api/user/1/icon')
      .expect(403)
      .end(done);
  });

  test('他人のID（IDOR） → 403', done => {
    const token = generateToken(1);
    request(app)
      .put('/api/user/999/icon')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .end(done);
  });

  test('本人のID + ファイルなし → 400', done => {
    const token = generateToken(1);
    request(app)
      .put('/api/user/1/icon')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .end(done);
  });

  test('本人のID + 画像ファイルあり → 200', done => {
    const token = generateToken(1);
    db.query.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 1 }));
    request(app)
      .put('/api/user/1/icon')
      .set('Authorization', `Bearer ${token}`)
      .attach('icon', Buffer.from('fake-image'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .field('profile_picture_url', 'avatar.png')
      .expect(200)
      .end(done);
  });
});
