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
      likes: 0,
    };
  });
  console.log(candidates);

  // token 으로 투표 생성 유저를 츶기
  const cur_user = await User.findOne({
    token: req.body.token,
  });

  await voteList.insertMany({
    room_info: req.body.room_info,
    creater: cur_user.username,
    products: candidates,
  });

  res.send("success create vote");
});

voteRouter.delete("/", async (req, res) => {
  if (req.body){
    await voteList.findByIdAndDelete(req.body._id)
    res.send("success to del vote")
    return;
  } else {
    res.send("fail to del vote")
  }
});

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
voteRouter.put("/", async (req, res) => {
	const oldBoard = await voteList.findById(req.body._id);
	const newBoard = await oldBoard.products?.map((element) => {
			if (element.product_name === req.body.product_name) {
					element.likes += 1;
					return element;
			} else {
					return element;
			}
	});
	console.log(newBoard, "newBoard");
	await voteList.updateOne(
			{ _id: req.body._id },
			{
					$set: {
							products: newBoard,
					},
			}
	);
	res.send("check it yourself");
});


module.exports = voteRouter;
