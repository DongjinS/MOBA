const User = require('../models/User');

// 인증 처리
const auth = (req, res, next) => {
  // 쿠키에서 토큰을 가져온다.
  const token = req.cookies.x_auth;
  // 토큰을 복호화하여 유저를 찾는다.
  User.findByToken(token, (error, user) => {
    if (error) throw error;
    if (!user) return res.json({ isAuth: token, error: true });

    req.token = token;
    req.user = user;
    next();
  })
};

module.exports = { auth };