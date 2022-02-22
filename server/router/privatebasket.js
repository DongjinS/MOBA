const express = require('express');
const basketRouter = express.Router();
const User = require('../models/User');

// TODO : 함께 쇼핑 종료시 유저의 위시리스트에 공유위시리스트 품목 넣기 + 공유 위시리스트 삭제

basketRouter.param('id', async (req, res, next, value) => {
  req.id = value;
  next();
});

// 선택 품목 유저 위시리스트 넣기
// url : http://www.moba.com/privatebasket
// method: post
// data: 유저 정보(토큰) , products 정보
basketRouter.post('/', async (req, res) => {
  console.log('post these products on to private basket');
  console.log(req.body);

  // 토큰으로 유저 찾고 - 잘못된 유저 찾은
  const cur_user = await User.findOne({
    token: req.body.token,
  });

  console.log(cur_user);
  // 유저의 기존 장바구니의 url 모아서
  const prev_products_url = cur_user?.products?.map(
    (product) => product.shop_url
  );

  console.log(prev_products_url);
  // 새로 장바구니에 넣으려는게 이미 있는지 확인하고
  const add_products = req.body.products?.filter((product) => {
    if (prev_products_url.includes(product.shop_url)) {
    } else {
      return product;
    }
  });
  console.log('add_products', add_products);

  // 새로 넣으려는 상품 전부 중복이면 ( 0 | undefined) 바로 리턴
  if (add_products?.length === 0 || add_products?.includes(undefined)) {
    console.log('duplicated products');
    res.statusCode = 404;
    res.send('duplicated products');
    return;
  }

  // 장바구니에 추가하기
  await User.updateOne(
    { token: req.body.token },
    {
      $addToSet: {
        products: add_products,
      },
    }
  );

  // 잘 들어갔는지 확인 용도 - 추후에 지워야함
  // post_cur_user = await User.findOne({ token: req.body.token });
  // console.log(post_cur_user);
  res.statusCode = 200;
  res.send('success post new product in private basket');
});

// delete helper
async function deleteProduct(token, products, shop_url) {
  const new_products = products?.filter(
    (product) => product.shop_url !== shop_url
  );
  await User.updateOne(
    { token: token },
    {
      $set: {
        products: new_products,
      },
    }
  );
}
// 개인 장바구니 품목 삭제 : 개인 장바구니에서 상품 선택 후 삭제
// url : http://www.moba.com/privatebasket
// method: delete
// data: 누구의 장바구니에서 삭제할지 - 유저 정보(토큰), 무엇을 삭제할지 - 상품 정보
// res: success or fail
basketRouter.delete('/', async (req, res) => {
  console.log('IN private basket, try to delete the selected products');
  console.log(req.body);

  const cur_user = await User.findOne({
    token: req.body.token,
  });

  try {
    await deleteProduct(cur_user.token, cur_user.products, req.body.shop_url);
    console.log('success to delete');
    res.send('delete the selected products');
  } catch (error) {
    console.log('fail to delete');
    res.send('no product to delete in privated basket');
  }
});

basketRouter.get('/:id', async (req, res) => {
  console.log('IN private basket, try to get the products');
  // console.log(req.id);
  const cur_user = await User.findOne({
    token: req.id,
  });
  try {
    // console.log(cur_user);
    // console.log(cur_user.products);

    res.send(cur_user.products);
  } catch (error) {
    res.send([]);
  }
});

// 내 장바구니 담기
basketRouter.post('/basket', async (req, res) => {
  const basket_user = await User.findOne({
    token: req.body.token,
  });
  console.log(basket_user.products);
  res.send(basket_user.products);
});

module.exports = basketRouter;
