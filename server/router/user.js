const express = require('express');
const userRouter = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');


userRouter.post('/register', (req, res) => {
  //회원 가입 할때 필요한 정보들을 client에서 가져오면 데이터 베이스에 넣어준다.
  const user = new User(req.body);
  user.save((error, userInfo) => {
    if (error) return res.json({ success: false, error });
    return res.status(200).json({
      success: true,
    });
  });
});

userRouter.post('/info', async (req, res) => {
  const user = await User.findOne({ token: req.body.token });
  console.log(user.username);
  return res.send(user);
});

userRouter.post('/login', (req, res) => {
  // 요청된 아이디를 데이터 베이스에서 찾는다.
  User.findOne({ username: req.body.username }, (error, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '입력하신 아이디에 해당하는 유저가 없습니다.',
      });
    }

    // 데이터 베이스에 있다면 비밀번호가 맞는지 확인한다.
    user.comparePassword(req.body.password, (error, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        });
      // 비밀번호가 맞다면 토큰을 생성한다.
      user.generateToken((error, user) => {
        if (error) return res.status(400).send(error);

        // 토큰을 저장한다.
        if (req.cookies.room === undefined) {
          res
            .cookie('x_auth', user.token)
            .status(200)
            .json({ loginSuccess: true, userId: user._id, token: user.token });
        } else {
          res.cookie('x_auth', user.token).status(200).json({
            loginSuccess: true,
            userId: user._id,
            room: req.cookies.room,
          });
        }
      });
    });
  });
});

userRouter.get('/auth', auth, (req, res) => {
  res.status(200).json({
    isAuth: true,
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
});

userRouter.get('/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    console.log(req.user._id),
    { token: '' },
    (error, user) => {
      if (error) {
        return res.json({ success: false, error });
      }
      return res.clearCookie('x_auth').status(200).send({
        success: true,
        message: '로그아웃 되었습니다.',
      });
    }
  );
});

module.exports = userRouter;
