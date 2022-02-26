import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Header from '../../header/Header';
import styles from './VoteResult.module.css';

const VoteResult = () => {
  const [voteResultList, setVoteResultList] = useState([]);
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }
  const token = getCookie('x_auth');
  useEffect(() => {
    axios
      .post(`/voteresult`, {
        token: token,
      })
      .then((response) => {
        console.log(response.data);
        setVoteResultList(response.data);

        for (var result of response.data) {
          console.log(result.room_message);
          console.log(result.products);
          for (var itemResult of result.products) {
            console.log(itemResult.likes);
          }
          console.log('----------------------------');
        }
      });
  }, []);
  const handleDelete = function () {
    // 삭제 함수 구현
    console.log('찍히냐?');
  };
  return (
    <div className={styles.resultPage}>
      <Header />
      <div className={styles.votes__container}>
        {voteResultList.reverse().map((items, index) => (
          <div className={styles.vote__container} key={index}>
            <div className={styles.vote__title}>
              <div className={styles.voteNum}>
                <span>vote {index + 1}</span>
              </div>
              <div className={styles.message}>
                <span>{items.room_message}</span>
              </div>
              <div onClick={handleDelete} className={styles.close}>
                삭제
              </div>
            </div>
            <div className={styles.cards}>
              {items.products
                .sort(function (a, b) {
                  return b.likes - a.likes;
                })
                .map((result, index) => (
                  <div className={styles.card} key={index}>
                    <img src={result.img} alt="img" />
                    <h3>투표 결과 : {result.likes}</h3>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoteResult;
