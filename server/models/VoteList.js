const mongoose = require("mongoose");

const voteListSchema = mongoose.Schema({
  room_info: String,
  creater: String,
  products: [
    {
      product_name: String,
      price: Number,
      sale_price: Number,
      shop_name: String,
      shop_url: String,
      img: String,
      removedBgImg: String,
      likes: Number,
    },
  ],
  room_message: String
});

module.exports = mongoose.model("voteList", voteListSchema);
