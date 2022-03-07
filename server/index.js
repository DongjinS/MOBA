const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const socket = require('socket.io');

const config = require('./config/key');
const User = require('./models/User');
const { auth } = require('./middleware/auth');
const roomRouter = require('./router/room');
const userRouter = require('./router/user');
const oauthRouter = require('./router/oauth');

const basketRouter = require('./router/privatebasket');
const voteRouter = require('./router/vote');
const voteResultRouter = require('./router/voteResult');
// 컬렉션 관련 //
const collectionRouter = require('./router/collection');

const app = express();

///// 소셜 로그인 관련 /////
// const winston = require('winston');
// const logger = winston.createLogger();
// const qs = require('qs');
// const fetch = require('node-fetch');

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(console.log('MongoDB Connected'))
  .catch((error) => console.log(error));

app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(
  bodyParser.json({
    limit: '5mb',
  })
);
app.use(cookieParser());

///// 로그인 / 회원가입 관련 /////
app.use('/api/users', userRouter);

///// 공유 위시리스트 관련 /////
app.use('/room', roomRouter);
//////////////////////////////
///// 개인 장바구니 라우팅 /////
app.use('/privatebasket', basketRouter);
//////////////////////////////
///// 투표 라우팅 /////
app.use('/vote', voteRouter);
//////////////////////////////
app.use('/voteResult', voteResultRouter);

/// 콜렉션 ///
app.use('/collection', collectionRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/oauth', oauthRouter);

///// 영상 통화 및 화면 공유 /////
const server = http.createServer(app);
const io = socket(server);
io.on('connection', (socket) => {
  console.log('hello this is server IO connection', socket.id);
  socket.on('join room', (roomID) => {
    const userCount = io.sockets.adapter.rooms.get(roomID)?.size;

    if (userCount === undefined || userCount === 0) {
      // If room does not exists, user started a new room
      socket.join(roomID);
      // Set user id of the user
      socket['userID'] = socket.id;
    } else if (userCount === 1) {
      console.log('rooms', io.sockets.adapter.rooms.get(roomID));
      io.in(socket.id).socketsJoin(roomID);
      const rooms = io.sockets.adapter.rooms.get(roomID);
      const otherUser = [...rooms][0];

      // to 입장 시도자
      socket.emit('other user', otherUser);
      // to 기존 입장자
      socket.to(otherUser).emit('user joined', socket.id);
    } else {
      // 두명 이상 출입 금지
      socket.emit('exceedRoom');
    }
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });

  // 'leave-room': When one user left the room
  socket.on('leave-room', (roomID, done) => {
    // Notify other peer that current user is leaving the room
    socket.to(roomID).emit('peer-leaving', socket.id);
    // Leave the room
    socket.leave(roomID);
    done();
  });

  socket.on('disconnecting', () => {
    console.log('disconnecting', socket.id);
    console.log(socket.rooms);
    socket.rooms.forEach((room) => {
      console.log(room);
      socket.to(room).emit('peer-leaving', socket.id);
      // Notify other peer that current user is leaving
      // Leave the room
      socket.leave(room);
    });
  });
});

/**  ----------- S3 ------------ */
const aws = require('aws-sdk');

async function generateUploadURL(req) {
  const region = 'ap-northeast-2';
  const bucketName = 'moba-nukki';
  const accessKeyId = config.AWS_ACCESS_KEY_ID;
  const secretAccessKey = config.AWS_SECRET_ACCESS_KEY;

  const s3 = new aws.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: 'v4',
  });

  const imageName = req.params.id;

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return uploadURL;
}

app.get('/s3Url/:id', async (req, res) => {
  console.log('here');
  const url = await generateUploadURL(req);
  console.log(url);
  res.send({ url });
});

server.listen(8000);
