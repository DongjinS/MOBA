const express = require("express");
const collectionRouter = express.Router();
const voteList = require("../models/VoteList");
const User = require("../models/User");

collectionRouter.get('/', (req, res) => {
  console.log('콜렉션 페이지 요청입니다.')
  User.find().select('products').where('product_name').then((users) => {
    const result = users
    res.send(result)
  })
})

collectionRouter.post('/items', async (req, res) => {
  const collector = await User.findOne({ token: req.body.token });
  let new_items = [req.body.products]
  await collector.collections?.map((items) => {
    new_items.push(items);
  })
  collector.collections = new_items;
  collector.save()
});
module.exports = collectionRouter
