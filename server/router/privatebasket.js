const express = require('express');
const basketRouter = express.Router();
const User = require('../models/User');
const axios = require('axios');
const cheerio = require('cheerio');

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
  // 토큰으로 유저 찾고 - 잘못된 유저 찾은
  const cur_user = await User.findOne({
    token: req.body.token,
  });

  // 유저의 기존 장바구니의 url 모아서
  const prev_products_url = cur_user?.products?.map((product) => product.shop_url);

  // 새로 장바구니에 넣으려는게 이미 있는지 확인하고
  const add_products = req.body.products?.filter((product) => {
    if (prev_products_url.includes(product.shop_url)) {
    } else {
      return product;
    }
  });

  // 새로 넣으려는 상품 전부 중복이면 ( 0 | undefined) 바로 리턴
  if (add_products?.length === 0 || add_products?.includes(undefined)) {
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
  res.statusCode = 200;
  res.send('success post new product in private basket');
});

// delete helper
async function deleteProduct(token, products, shop_url) {
  const new_products = products?.filter((product) => product.shop_url !== shop_url);
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
basketRouter.delete('/product', async (req, res) => {
  const cur_user = await User.findOne({
    token: req.body.token,
  });

  try {
    await deleteProduct(cur_user.token, cur_user.products, req.body.shop_url);
    res.send('delete the selected products');
  } catch (error) {
    res.send('no product to delete in privated basket');
  }
});

basketRouter.get('/:id', async (req, res) => {
  const cur_user = await User.findOne({
    token: req.id,
  });
  try {
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
  res.send(basket_user.products);
});

basketRouter.post('/basketParsing', async (req, res) => {
  url = req.body.shopUrl;
  const parsing_result = await parse_product(url);
  res.send(parsing_result);
});

// w-concept
function w_concept(html, url) {
  let shop_name, shop_url, img_url, product_name, price, sale_price;
  const $ = cheerio.load(html); // html load

  product_name = $("meta[property='og:description']").attr('content');
  price = $("meta[property='eg:originalPrice']").attr('content');
  sale_price = $("meta[property='eg:salePrice']").attr('content');
  shop_name = $("meta[property='og:site_name']").attr('content');
  shop_url = url;
  img_url = $("meta[property='og:image']").attr('content');

  const new_product = {
    product_name: product_name,
    price: price,
    sale_price: sale_price,
    shop_name: shop_name,
    shop_url: shop_url,
    img: img_url,
  };

  return new_product;
}

// 무신사
function musinsa(html, url) {
  let shop_name, shop_url, img_url, product_name, price, sale_price;
  const $ = cheerio.load(html); // html load

  product_name = $('#page_product_detail > div.right_area.page_detail_product > div.right_contents.section_product_summary > span > em').text();
  price = $('#goods_price').text().trim();
  // price parsing - e.g. 110,000원 -> 110000
  price = Number(
    price
      .slice(0, -1)
      .split(',')
      .reduce((a, b) => a + b)
  );

  sale_price = $('#sPrice > ul > li > span.txt_price_member.m_list_price').text();
  sale_price = Number(
    sale_price
      .slice(0, -1)
      .split(',')
      .reduce((a, b) => a + b)
  );
  shop_name = 'Musinsa';
  shop_url = url;
  img_url = $("meta[property='og:image']").attr('content');

  const new_product = {
    product_name: product_name,
    price: Number(price),
    sale_price: sale_price,
    shop_name: shop_name,
    shop_url: shop_url,
    img: img_url,
  };
  return new_product;
}

// 브랜디
function brandi(html, url) {
  let shop_name, img_url, product_name, price, sale_price, shop_url;
  const $ = cheerio.load(html); // html load

  shop_name = '브랜디';
  shop_url = url;
  img_url = $("meta[property='og:image']").attr('content');
  product_name = $('#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail_title_area > h1').text();
  price = $(
    '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail-price-wrapper.hideFinalPriceSection > div > div > span > span'
  ).text();
  price = Number(price.split(',').reduce((a, b) => a + b));
  sale_price = $(
    '#container > div > div.wrap-products-info > div.wrap-detail_info > div.detail_basic-info > div.detail-price-wrapper.hideFinalPriceSection > div > div > em > span'
  ).text();
  sale_price = Number(sale_price.split(',').reduce((a, b) => a + b));

  const new_product = {
    product_name: product_name,
    price: price,
    sale_price: sale_price,
    shop_name: shop_name,
    shop_url: shop_url,
    img: img_url,
  };

  return new_product;
}

async function parse_product(url) {
  let new_product;
  const split_url = url.split('/');
  const cur_shop = split_url[2];
  // 서비스 가능한 사이트만 req 요청 보내기
  if (['www.wconcept.co.kr', 'store.musinsa.com', 'www.brandi.co.kr'].includes(cur_shop)) {
    await axios
      .get(url)
      .then((dataa) => {
        const html = dataa.data;
        switch (cur_shop) {
          case 'www.wconcept.co.kr':
            new_product = w_concept(html, url);
            break;
          case 'store.musinsa.com':
            new_product = musinsa(html, url);
            break;
          case 'www.brandi.co.kr':
            new_product = brandi(html, url);
            break;
          default:
            break;
        }
      })
      .catch();
  }
  return new_product;
}

module.exports = basketRouter;
