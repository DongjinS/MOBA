import React, { useState } from "react";
import AddProduct from "../addUrl/AddProduct";
import axios from "axios";
import styles from "./RoomMemu.module.css";
import WishList from "../wishlist/Wishlist";
import Loading from "../loading/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useParams } from "react-router-dom";

const RoomMemu = props => {
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const roomNumber = window.location.pathname.split("/")[2];
  const [isLoading, setIsLoading] = useState(false);

  const [checkedInputs, setCheckedInputs] = useState([]);

  const changeHandler = (checked, id) => {
    if (checked) {
      setCheckedInputs([...checkedInputs, id]);
    } else {
      setCheckedInputs(checkedInputs.filter(el => el !== id));
    }

    console.log("changeHandler : ", checkedInputs);
  };

  const getCookie = cookieName => {
    var cookieValue = null;
    if (document.cookie) {
      var array = document.cookie.split(escape(cookieName) + "=");
      if (array.length >= 2) {
        var arraySub = array[1].split(";");
        cookieValue = unescape(arraySub[0]);
      }
    }
    return cookieValue;
  };

  const handleVotes = () => {
    toast.warn("이 기능은 아직 활성화되지 않았습니다.", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleMylistClick = () => {
    const token = getCookie("x_auth");

    console.log("changeHandler : ", checkedInputs);
    console.log("cookie : ", token);

    if (checkedInputs.length === 0) {
      console.log("선택된 상품이 없습니다.");
      return;
    }
    axios
      .post(`/privatebasket`, {
        token: token,
        products: checkedInputs,
      })
      .then(Response => {
        toast("내 장바구니에 저장되었습니다😊", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log("private basket save success");
        console.log(Response.data);
      })
      .catch(Error => {
        console.log(Error);
      });
  };

  const roomID = useParams().roomID;

  const getWishList = () => {
    setIsLoading(true);
    axios
      .get(`/room/${roomNumber}/wishlist`)
      .then(Response => {
        console.log("axios get");
        setIsLoading(false);
        setProducts(Response.data);
      })
      .catch(Error => {
        console.log(Error);
      });
  };

  const HandleWishlist = () => {
    getWishList();
    if (isWishlistOpen) {
      setWishlistOpen(false);
    } else {
      setWishlistOpen(true);
    }
  };

  const deleteAPIWishlistItem = shop_url => {
    axios
      .delete(`/room/${roomNumber}/wishlist`, { data: { shop_url } })
      .then(function (response) {
        console.log(response);
        setProducts(products?.filter(product => product.shop_url !== shop_url));
      })
      .catch(function (error) {
        console.log(error.response);
      })
      .then("delete : ", console.log(products));
  };

  const deleteItem = shop_url => {
    console.log("deleteItem : ", shop_url);
    deleteAPIWishlistItem(shop_url);
  };

  const handleAddProduct = new_product => {
    setProducts([...products, new_product]);
  };

  // 화상 창 닫으면 - 유저 토큰 + 위시리스트 상품들 정보 긁어서 post privatebasket
  window.addEventListener("unload", () => {
    /*방 닫히면 위시리스트에 있던 상품들 개인 장바구니에 넣기 - 잠시 주석 */
    // const token = getCookie('x_auth');
    // axios.post(`/privatebasket`, { token, products }).then((response) => {
    //   if (response.data.success) {
    //     return (document.location.href = '/');
    //   }
    // });
    // 두명 다 나갈때만 해야함
    // axios.delete(`/room/${roomID}`).then(response => {
    //   if (response.data.success) {
    //     return (document.location.href = "/");
    //   }
    // });
  });

  return (
    <>
      <div className={styles.menus}>
        <AddProduct handleAddProduct={handleAddProduct} />

        <div className={styles.menuList}>
          {/* 화면 공유 */}
          <button className={styles.buttons} onClick={props.onShareScreen}>
            <i className="fa-brands fa-slideshare fa-xl"></i>
          </button>

          {/* 공유 위시리스트  */}
          <button className={styles.buttons} onClick={HandleWishlist}>
            <i className="fa-solid fa-hand-holding-heart fa-xl"></i>
          </button>

          {/* 장바구니 */}
          <button className={styles.buttons} onClick={handleMylistClick}>
            <i className="fa-solid fa-cart-plus fa-xl"></i>
          </button>
          <ToastContainer
            position="bottom-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* 투표 결과 확인 */}
          <button className={styles.buttons} onClick={handleVotes}>
            <i class="fa-solid fa-check-to-slot fa-xl"></i>
          </button>
          <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </div>
      <div>
        {isWishlistOpen ? isLoading === true ? <Loading /> : <WishList data={products} deleteItem={deleteItem} changeHandler={changeHandler} /> : <></>}
      </div>
    </>
  );
};

export default RoomMemu;
