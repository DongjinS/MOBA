import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  // react-dom이 id root라는 html에 위에 있는 우리 컴포넌트를 연결시켜줌
  document.getElementById("root")
);
