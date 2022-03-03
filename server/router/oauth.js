const express = require('express');
const oauthRouter = express.Router();
const winston = require('winston');
const logger = winston.createLogger();
const qs = require('qs');
const fetch = require('node-fetch');

const User = require('../models/User');
const { auth } = require("../middleware/auth");

class Kakao {
  constructor(code) {
    this.url = 'https://kauth.kakao.com/oauth/token';
    this.clientID = '497af053ca6574eb9e8a19b5797cf024';
    this.clientSecret = 'HLhen6EGLnjgs2g7OmfBNGnwnYpWWekL';
    this.redirectUri = 'http://localhost:8000/oauth/kakao';
    this.code = code;
    this.userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
  }
}

//  TODO Naver

//  TODO Google

const getAccessToken = async (options) => {
  try {
    return await fetch(options.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: qs.stringify({
        grant_type: 'authorization_code',
        client_id: options.clientID,
        client_secret: options.clientSecret,
        redirectUri: options.redirectUri,
        code: options.code,
      }),
    }).then(res => res.json());
  } catch (e) {
    logger.info("error", e);
  }
};

const getUserInfo = async (url, access_token) => {
  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Authorization': `Bearer ${access_token}`
      }
    }).then(res => res.json());
  } catch (e) {
    logger.info("error", e);
  }
};

const getOption = (coperation, code) => {
  switch (coperation) {
    case 'kakao':
      return new Kakao(code);
      break;
    case 'google':
      // return new Google(code);
      break;
    case 'naver':
      // return new Naver(code);
      break;
  }
}

oauthRouter.get(`/:coperation`, async (req, res) => {
  const coperation = req.params.coperation;
  const code = req.query.code;
  const options = getOption(coperation, code);
  const token = await getAccessToken(options);
  const userInfo = await getUserInfo(options.userInfoUrl, token.access_token);

  // TODO Redirect Frot Server (쿠키, 세션, local_store 중에 로그인을 유지한다.)
  // TODO Data Base or 쿠키 reflesh Token 저장 방법 모색
  console.log(userInfo);

  let body = {
    username: userInfo.kakao_account.email,
    password: userInfo.kakao_account.email,
    name: userInfo.properties.nickname,
    email: userInfo.kakao_account.email,
    token: token.access_token
  };
  console.log(body)

  User.findOne({ email: body.email }, (error, user) => {
    // user가 없다면
    if (!user) {
      const user = new User(body);
      user.save((error, userSave) => {
        if (error) {
          console.log('save error')
        }
      })

    }
    // user가 있다면
    user.token = token.access_token;
    user.save(function (error, user) {
      if (error) return cb(error)
    })
  })

  res
    .cookie('x_auth', token.access_token)
    .redirect('http://localhost:3000/mainpage')
})

module.exports = oauthRouter;