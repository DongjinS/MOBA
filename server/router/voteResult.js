const express = require("express");
const voteResultRouter = express.Router();
const voteList = require("../models/VoteList");
const User = require("../models/User");


voteResultRouter.post("/", async (req, res) => {

  // token 으로 투표 생성 유저를 츶기
  const cur_user = await User.findOne({
    token: req.body.token,
  });

  const creater = cur_user.username

  const voteResultList = await voteList.find({ creater: creater });
  console.log(voteResultList);

  res.send(voteResultList);
});




module.exports = voteResultRouter;