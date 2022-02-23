const express = require('express');
const urlToFileRouter = express.Router();
const User = require('../models/User');
const download = require('image-downloader');
const uuid = require('uuid');

const fetch = require('node-fetch');
const createWriteStream = require('fs');
const request = require('request');
const fs = require('fs');
const http = require('https');

// const blob = require('blob');
// const axios = require('axios');
// const cheerio = require('cheerio');

/*------------누끼따는 작업--------------------*/

/*------------post 작업--------------------*/

// url : http://www.moba.com/urlToFile.js
// method: post
// data: 유저 정보(토큰) , products 정보
urlToFileRouter.post('/', async (req, res) => {
  // console.log('뭐 들어오나', req.body.products[0].img);

  // 토큰으로 유저 찾고 - 잘못된 유저 찾은
  // const cur_user = await User.findOne({
  //   token: req.body.token,
  // });

  // const currUrl = req.body.products[0].img;
  const currId = uuid();
  // console.log(currId, 'currId');
  const options = {
    url: req.body.url,
    dest: `./testnukki/${currId}.jpg`,
  };

  // file을 저장
  download.image(options);
  // res.send(options.dest);
  // 장바구니에 추가하기
  // await User.updateOne(
  //   { token: req.body.token },
  //   {
  //     $addToSet: {
  //       products: add_products,
  //     },
  //   }
  // );

  res.send('success in removebg');
});

module.exports = urlToFileRouter;
