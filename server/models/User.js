const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    maxlength: 30,
  },
  password: {
    type: String,
    minlength: 5,
  },
  name: {
    type: String,
    maxlength: 10,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  role: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
  profileImage: {
    type: String,
  },
  products: [
    {
      product_name: String,
      price: Number,
      sale_price: Number,
      shop_name: String,
      shop_url: String,
      img: String,
      removedBgImg: String,
    },
  ],
});

//비밀번호를 암호화 시킨다.
userSchema.pre('save', function (next) {
  const user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function (error, salt) {
      if (error) return next(error);

      bcrypt.hash(user.password, salt, function (error, hash) {
        if (error) return next(error);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (error, isMatch) {
    if (error) return cb(error);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  const user = this;
  // 토큰 생성하기
  const token = jwt.sign(user._id.toHexString(), 'secretToken');
  user.token = token;
  user.save(function (error, user) {
    if (error) return cb(error);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  const user = this;
  jwt.verify(token, 'secretToken', function (error, decoded) {
    user.findOne(
      {
        _id: decoded,
        token: token,
      },
      function (error, user) {
        if (error) return cb(error);
        cb(null, user);
      }
    );
  });
};

module.exports = mongoose.model('User', userSchema);
