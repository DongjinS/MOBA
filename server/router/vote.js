const express = require("express");
const voteRouter = express.Router();
const voteList = require("../models/VoteList");
const User = require("../models/User");

voteRouter.post("/", async (req, res) => {
  // console.log(req.body);
  // 투표를 만들 상품들이 들어갈 리스트
  const candidates = req.body.products.map((product) => {
    return {
      product_name: product.product_name,
      price: product.price,
      sale_price: product.sale_price,
      shop_name: product.shop_name,
      shop_url: product.shop_url,
      img: product.img,
      removedBgImg: product.removedBgImg,
      likes: 0,
    };
  });

  // token 으로 투표 생성 유저를 츶기
  const cur_user = await User.findOne({
    token: req.body.token,
  });


  await voteList.insertMany({
    room_info: req.body.room_info,
    creater: cur_user.username,
    products: candidates,
    room_message: req.body.room_message
  });

  res.send("success create vote");
});


voteRouter.param("id", async (req, res, next, value) => {
  try {
    // console.log(value)
    let cur_user = await voteList.findOne({ room_info: value });
    if (!cur_user && req.method !== "DELETE") {
      [cur_user] = await voteList.insertMany({
        room_info: value,
        products: [],
        room_message: ""
      })
    }
    req.cur_user = cur_user;
    // console.log(req.cur_user)
    next();
  } catch (err) {
    next(err)
  }
})

voteRouter.get("/:id", ((req, res) => {
  // console.log(req.params.id)
  res
    .send({ products: req.cur_user.products, room_message: req.cur_user.room_message })
}))

// 함께 쇼핑(외부) : 개인 투표리스트 보기(영상통화, 화상통화)
// url : [www.moba.com/](http://www.moba.com/)myPage/vote
// method : get

voteRouter.get("/", async (req, res) => {
  console.log(req.body);
  if (req.body.creater) {
    console.log("here");
    res.send(await voteList.find({ creater: req.body.creater }));
  } else if (req.body.room_info) {
    res.send(await voteList.find({ room_info: req.body.room_info }));
  } else {
    res.send(
      'missing argument, "room_info" or "creater" needed for update the vote'
    );
  }
});

// 투표 받기 (외부 사용자)
// url: http://www.moba.com/vote/
// method: PUT
// data: ObjectId(vote) && Product(선택한 상품 정보)
// res: success || fail
voteRouter.put("/:id", async (req, res) => {
  // console.log(req.body.url);
  // console.log(req.cur_user);
  // const votes = voteList.find({ room_info: req.params.id })
  // console.log(votes)
  // console.log(req.params)
  // console.log(typeof req.params.id, typeof req.body.url)
  let tmp = await voteList.findOne({ room_info: req.params.id });
  let tmp2 = await tmp.products?.map((element) => {
    if (element.shop_url === req.body.url) {
      element.likes += 1;
      return element;
    }
    else {
      return element;
    }
  })
  await voteList.updateOne(
    { room_info: req.params.id }, {
    $set: {
      products: tmp2
    },
  }
  );
  res.send("check it yourself");
});

voteRouter.delete("/", async (req, res) => {
  if (req.body) {
    await voteList.findByIdAndDelete(req.body._id)
    res.send("success to del vote")
    return;
  } else {
    res.send("fail to del vote")
  }
});

module.exports = voteRouter;
