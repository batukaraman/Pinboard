create database pinboard;

use pinboard;

CREATE TABLE user (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fullname varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    createdAt varchar(255) NOT NULL
);

CREATE TABLE type (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(9) NOT NULL
);

INSERT INTO type (name, color)
VALUES
    ('Yorum', '#7B8FA1'),
    ('Not', '#FEC868'),
    ('Şikayet', '#F55050');

CREATE TABLE pin (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  publish BIT NOT NULL,
  content VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  positionX DECIMAL(18, 15) NOT NULL,
  positionY DECIMAL(18, 15) NOT NULL,
  userId INT NOT NULL,
  typeId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id),
  FOREIGN KEY (typeId) REFERENCES type(id)
);
