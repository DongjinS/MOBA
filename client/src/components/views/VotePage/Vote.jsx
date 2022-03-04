import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useHistory, useParams, useNavigate } from 'react-router-dom';
import { parse } from 'qs';
import styles from './Vote.module.css';
import Header from '../../header/Header';
import './Vote.css';
import { BsCheckLg } from 'react-icons/bs';

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
    await axios
      .put(`/vote/${roomID}`, {
        url: url,
      })
      .then(setVoting(false));
  }
  window.onload = function () {
    const voteContainers = document.querySelectorAll('.voteContainer');

    function handleClick(event) {
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
                className={styles.voteContainer}
                onClick={() => {
                  setChooseOne(items.shop_url);
                }}
              >
                <img className="voteContainer" src={items.img} alt="img" />
                <BsCheckLg className="i__check" />
              </div>
            ))}
          </div>
          <div>
            <button
              className={styles.completeBtn}
              onClick={() => {
                if (chooseOne != '') {
                  handleOnClick(chooseOne);
                } else {
                  alert('상품을 선택해주세요');
                }
              }}
            >
              투표완료
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.voteEnd}>
          <div className={styles.voteEndContainer}>
            <p className={styles.voteEndTitle}>투표해주셔서 감사합니다👏</p>
            <span>- TEAM MOBA 일동 -</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote;
