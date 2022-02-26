import React, { useState, useEffect } from "react";
import Product from "../wishlist/Product";
import "./Modal.css";
import Cookies from "universal-cookie";
import axios from "axios";
import { v1 as uuid } from "uuid";

const Modal = props => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const { open, close, header, products } = props;

  const [checkedInputs, setCheckedInputs] = useState([]);

  const changeHandler = item => {
    if (checkedInputs.includes(item)) {
      setCheckedInputs(checkedInputs.filter(checkedItem => checkedItem !== item));
    } else {
      setCheckedInputs([...checkedInputs, item]);
    }
  };

  const HandleSubmitVote = () => {
    function getCookie(name) {
      const cookies = new Cookies();
      return cookies.get(name);
    }
    const token = getCookie("x_auth");

    const id = uuid();

    const shareKakao = () => {
      window.Kakao.Link.sendDefault({
        objectType: "feed",
        content: {
          title: "모바",
          description: inputs.text,
          imageUrl: "#",
          link: {
            webUrl: `http://localhost:3000/vote/${id}`,
          },
        },
        buttons: [
          {
            title: "투표하기로 이동",
            link: {
              webUrl: `http://localhost:3000/vote/${id}`,
            },
          },
        ],
      });
    };

    const sendCheckedProduct = () => {
      axios.post("/vote", {
        token: token,
        products: checkedInputs,
        room_info: id,
        room_message: inputs.text,
      });
    };

    sendCheckedProduct();
    shareKakao();
  };
  const [inputs, setInputs] = useState({
    text: "",
  });

  const onChange = e => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  return (
    // 모달이 열릴때 openModal 클래스가 생성된다.
    <div className="container">
      <div className={open ? "openModal modal" : "modal"}>
        {open ? (
          <section className="section__">
            <header>
              나의 장바구니
              <button className="close" onClick={close}>
                {" "}
                &times;{" "}
              </button>
            </header>

            <main className="main">
              {console.log(products)}
              {products.length > 0 ? (
                products.map((item, index) => (
                  <div className="productCard" key={index}>
                    <div className="product">
                      <div style={{ position: "relative" }}>
                        <input className="productCheckbox" type="checkbox" onChange={() => changeHandler(item)} />
                        <img className="productImg" src={item.img} alt="상품이미지"></img>
                      </div>
                      <div style={{ display: "flex" }}>
                        <div className="shopTag">{item.shop_name}</div>
                        <a className="productFont shopLink" href={item.shop_url} target="_blank">
                          {item.product_name}
                        </a>
                      </div>
                      <div className="productFont">{item.price} 원</div>
                    </div>
                    <div style={{ margin: "5px auto", backgroundColor: "orange", height: "1.5px", width: "95%" }}></div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </main>

            <footer>
              {checkedInputs.length > 1 ? <h1>총 {checkedInputs.length} 개 투표하기</h1> : <h3>투표하시려면 상품을 2개 이상 선택해주세요</h3>}
              {checkedInputs.length > 1 ? (
                <form onSubmit={HandleSubmitVote}>
                  <input
                    className="voteInput"
                    name="text"
                    type="text"
                    onChange={onChange}
                    placeholder="투표 요청시 친구들에게 전달할 내용을 입력해주세요."
                    value={inputs.text}
                  ></input>
                  <button className="voteBtn" type="submit">
                    전송하기
                  </button>
                </form>
              ) : (
                <></>
              )}
            </footer>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default Modal;
