const express = require("express");
const { patch } = require('./Router/test');
const app = express();
const test = require("./Router/test")

app.use("/api", test);

/* React를 통해서 Build 완료한 이후 사용하는 코드 */

// client내의 build 파일과 연결
// app.use(express.static(path.join(__dirname, "client/build")));

// client내의 build 파일내 index.html 사용 
// app.get("/", function (req, res) {res.sendFile(path.join(__dirname, "client/build/index.html"))});

// React에서 router 사용할 경우
// app.get("*", function (req, res) {res.sendFile(path.join(__dirname, "client/build/index.html"))});

// 특정 페이지는 Node에서, 특정 페이지는 React에서 Routing할 경우
// 예시 1), '/node' 주소로 들어왔을 때는 Node에서 public으로 Routing 
// app.use('/node', express.static(patch.join(__dirname, 'public')));
// 예시 2), '/react' 주소로 들어왔을 때는 React에서 client/build로 Routing
// 정상적으로 사용하기 위해서는 client/src/package.json에서 "homepage"를 "/react"로 수정해야 함
// app.use('/react', express.static(path.join(__dirname, "client/build")));

const port = 8000;
app.listen(port, () => console.log(`listening on ${port}`));