import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useHistory, useParams, useNavigate } from 'react-router-dom';
import { parse } from 'qs';
import styles from './Vote.module.css';
import Header from '../../header/Header';
import './Vote.css';
let roomMessage;
const Vote = () => {
  const [products, setProducts] = useState([]);
  const [chooseOne, setChooseOne] = useState('');
  const [voting, setVoting] = useState(true);
  const roomID = useParams().roomID;

  useEffect(() => {
    axios.get(`/vote/${roomID}`).then((Response) => {
      roomMessage = Response.data.room_message;
      setProducts(Response.data.products);
    });
  }, []);

  async function handleOnClick(url) {
    console.log(url, 'url 들어가나요?');
    await axios
      .put(`/vote/${roomID}`, {
        url: url,
      })
      .then(setVoting(false));
  }
  window.onload = function () {
    const voteContainers = document.querySelectorAll('.voteContainer');

    function handleClick(event) {
      console.log(event.target, 'event.target');
      console.log(event.target.classList, 'event.target.classList');

      if (event.target.classList[1] === 'clicked') {
        event.target.classList.remove('clicked');
      } else {
        for (let j = 0; j < voteContainers.length; j++) {
          voteContainers[j].classList.remove('clicked');
        }
        event.target.classList.add('clicked');
      }
    }

    for (let i = 0; i < voteContainers.length; i++) {
      voteContainers[i].addEventListener('click', handleClick);
    }
  };

  return (
    <div className={styles.votePage}>
      <Header />
      {voting ? (
        <div className={styles.voteInnerPage}>
          <div className={styles.voteTitle}>
            <span>{roomMessage}</span>
          </div>
          <div className={styles.myBasket}>
            {products?.map((items, index) => (
              <div
                key={index}
                className={styles.voteContainers}
                onClick={() => {
                  setChooseOne(items.shop_url);
                  // console.log(items.shop_url, '현재 url값');
                  // console.log(chooseOne, '선택된 url값');
                }}
              >
                <img className="voteContainer" src={items.img} alt="img" />
                {/* <p>
                <strong>{items.shop_name}</strong>
              </p>
              <p>{items.product_name}</p>
              <p>
                <strong>{items.sale_price} 원</strong>
              </p>
              <p>
                <strong>{items.likes} 명이 좋아해요!</strong>
              </p>
              <p>
                <button onClick={() => handleOnClick(items.shop_url)}>
                  투표하기!
                </button>
              </p> */}
              </div>
            ))}
          </div>
          <div>
            <button
              className={styles.completeBtn}
              onClick={() => handleOnClick(chooseOne)}
            >
              투표완료
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.voteEnd}>
          <div className={styles.voteEndContainer}>
            <span className={styles.voteEndTitle}>
              투표해주셔서 감사합니다.
            </span>
            <button onClick={exit}></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote;
