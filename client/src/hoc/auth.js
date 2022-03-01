import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../_actions/user_action";
import { useNavigate } from "react-router-dom";

export default function (SpecificComponent, option, adminRoute = null) {
  // option : null -> 아무나 접속 가능, true -> 로그인한 사용자만 접속 가능, false -> 로그인 안 한 사람만 접속 가능
  function AuthenticationCheck(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
      dispatch(auth()).then((response) => {
        // 로그인 하지 않은 상태
        if (!response.payload.isAuth) {
          if (option === "login") {
            navigate("/login");
          } else if (option === "register") {
            navigate("/register");
          } else if (option === true) {
            navigate("/");
          }
        }
      });
    }, []);
    return <SpecificComponent />;
  }
  return AuthenticationCheck;
}
