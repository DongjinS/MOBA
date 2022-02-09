const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ test: "Console Print : Team MOBA" });
});

module.exports = router;