import React, { useState, useEffect } from "react";
import { v1 as uuid } from "uuid";
import styles from "./CreateRoom.module.css";
import Auth from "../../../hoc/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../header/Header";
import Cookies from "universal-cookie";
import Modal from "../../Modal/Modal";

const CreateRoom = props => {
  // useState를 사용하여 open상태를 변경한다. (open일때 true로 만들어 열리는 방식)
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  // 쿠키 받아옴
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }

  if (getCookie("room")) {
    document.location.href = "/invited";
  }

  /* create room 페이지 들어오면 토큰을 서버에 전달, 
  서버에서 내 장바구니 물건 정보 받아옴 */
  useEffect(() => {
    const token = getCookie("x_auth");
    axios
      .post(`/createroom`, { token })
      .then(Response => {
        setProducts([...Response.data]);
      })
      .catch(Error => {
        console.log(Error);
      });

    console.log("Create Room Products: ", products);
  }, []);

  function create() {
    const id = uuid();
    const shopWidth = window.screen.width * 0.85;
    const userWidth = window.screen.width * 0.15;

    window.open(
      "./chooseshop",
      "shops",
      `width=${shopWidth}, left=${userWidth}, top=0, height=10000, scrollbars=yes, resizable, status=yes, menubar=yes, titlebar=yes`
    );

    window.open(`/room/${id}`, `videochat`, `width=${userWidth}, top=0, left=-10000, height=10000, scrollbars=yes, resizable=no`, "target");
    // props.history.push(`/room/${id}`);
  }
  const navigate = useNavigate();
  const logout = () => {
    axios.get("/api/users/logout").then(response => {
      if (response.data.success) {
        navigate("/");
      }
      navigate("/");
    });
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.btnWrapper} id={styles.firstWrapper}>
          <button className={styles.buttons}>친구관리</button>
        </div>
        <div className={styles.btnWrapper}>
          <button className={styles.buttons} onClick={openModal}>
            장바구니
          </button>
        </div>
        <div className={styles.btnWrapper}>
          <button id={styles.shoppingStart} className={styles.buttons} onClick={create}>
            쇼핑시작
          </button>
          <Modal open={modalOpen} close={closeModal} header="나의 장바구니" />
        </div>
        <div className={styles.btnWrapper}>
          <button className={styles.buttons} id={styles.logoutBtn} onClick={logout}>
            {" "}
            로그아웃{" "}
          </button>
        </div>
      </div>
    </>
  );
};

export default Auth(CreateRoom, true);
