const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const socket = require("socket.io");

const config = require("./config/key");
const User = require("./models/User");
const { auth } = require("./middleware/auth");
const roomRouter = require('./router/room');
const userRouter = require('./router/user');
const oauthRouter = require('./router/oauth')

const app = express();

///// 소셜 로그인 관련 /////
// const winston = require('winston');
// const logger = winston.createLogger();
// const qs = require('qs');
// const fetch = require('node-fetch');



mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(console.log("MongoDB Connected"))
  .catch((error) => console.log(error));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

///// 로그인 / 회원가입 관련 /////
app.use('/api/users', userRouter);

///// 공유 위시리스트 관련 /////
app.use('/room', roomRouter);
//////////////////////////////

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use('/oauth', oauthRouter);

///// 영상 통화 및 화면 공유 /////
const server = http.createServer(app);
const io = socket(server);
const rooms = {};
io.on("connection", (socket) => {
  socket.on("join room", (roomID) => {
    if (rooms[roomID]) {
      // 이미 있는 방이면
      rooms[roomID].push(socket.id); // socket.id를 roomID를 key로 갖는 object에 push
    } else {
      // 그게 아니면 rooms에 roomID를 key로 하는 배열 생성
      rooms[roomID] = [socket.id];
    }
    // roomID를 key로 갖는 방에 나 말고 다른 socket.id가 있으면 다른 user임
    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      // 다른 user가 존재하면
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });

  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });
});
///////////////////////////////////




server.listen(8000);
