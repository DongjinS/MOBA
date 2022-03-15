const express = require('express');
const collectionRouter = express.Router();
const voteList = require('../models/VoteList');
const User = require('../models/User');

collectionRouter.get('/', (req, res) => {
  User.find().then((users) => {
    const result = users;
    res.send(result);
  });
});

collectionRouter.post('/items', async (req, res) => {
  const collector = await User.findOne({ token: req.body.token });
  let new_items = [req.body.products];
  await collector.collections?.map((items) => {
    new_items.push(items);
  });
  collector.collections = new_items;
  collector.save();
  res.send('success');
});
collectionRouter.delete('/items', async (req, res) => {
  const collector = await User.findOne({ token: req.body.token });
  collector.collections.splice(req.body.index, 1);
  collector.save();
  res.send(collector.collections);
});
collectionRouter.post('/', async (req, res) => {
  const collector = await User.findOne({ token: req.body.token });
  res.send(collector.collections);
});

module.exports = collectionRouter;
