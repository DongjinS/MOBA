const mongoose = require('mongoose');

const wishListSchema = mongoose.Schema({
  room_info: String,
  products: [
    {
      product_name: String,
      price: Number,
      sale_price: Number,
      shop_name: String,
      shop_url: String,
      img: String,
      category: String,
    },
  ],
});

module.exports = mongoose.model('SharedWishList', wishListSchema);
