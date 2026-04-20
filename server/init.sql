CREATE DATABASE IF NOT EXISTS baristana_db;
USE baristana_db;

CREATE TABLE IF NOT EXISTS user (
  id int NOT NULL AUTO_INCREMENT,
  google_id varchar(255) NOT NULL,
  username varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  profile_picture_url varchar(255) DEFAULT NULL,
  access_token varchar(255) DEFAULT NULL,
  created_at datetime NOT NULL,
  refresh_token varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY google_id (google_id)
);

CREATE TABLE IF NOT EXISTS active_user (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  last_activity datetime NOT NULL,
  chat_enabled tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY user_id (user_id)
);

CREATE TABLE IF NOT EXISTS chat_message (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  message text NOT NULL,
  created_at datetime NOT NULL,
  PRIMARY KEY (id),
  KEY user_id (user_id)
);

CREATE TABLE IF NOT EXISTS bgm (
  id int NOT NULL AUTO_INCREMENT,
  file_url varchar(255) NOT NULL,
  title varchar(255) DEFAULT NULL,
  artist varchar(255) DEFAULT NULL,
  duration float DEFAULT NULL,
  PRIMARY KEY (id)
);

-- BGM seed data
-- file_url にカテゴリ名（cafe / barista / people）を含める必要あり
-- S3バケットのURLが確認できたら実際のURLに差し替えること
INSERT INTO bgm (file_url, title) VALUES
('baristana-bgm/cafe-music/Jane Street - TrackTribe.mp3', 'Jane Street'),
('baristana-bgm/cafe-music/On The Rocks - TrackTribe.mp3', 'On The Rocks'),
('baristana-bgm/cafe-music/Squirm Worm - TrackTribe.mp3', 'Squirm Worm'),
('baristana-bgm/cafe-music/Strollin\' - TrackTribe.mp3', 'Strollin'),
('baristana-bgm/barista-sounds/the-making-of-a-latte-33143.mp3', 'The Making of a Latte'),
('baristana-bgm/people-talking/Coffee Shop.mp3', 'Coffee Shop');
