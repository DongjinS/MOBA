import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Header from '../../header/Header';
import styles from './VoteResult.module.css';
import './VoteResult.css';
let tmp;
let mostLikes = [];
const VoteResult = () => {
  const [voteResultList, setVoteResultList] = useState([]);
  const [isReady, setIsReady] = useState(true);
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
        console.log(response.data, 'response.data');
        setVoteResultList(response.data);
        for (var result of response.data) {
          console.log(result.room_message);
          console.log(result.products);

          let maxLike = -1;
          for (var itemResult of result.products) {
            if (maxLike < itemResult.likes) {
              maxLike = itemResult.likes;
            }
            console.log(itemResult.likes, 'likes??');
          }
          mostLikes.push(maxLike);
          console.log(mostLikes, 'mostLikes');
          console.log('----------------------------');
        }
        setIsReady(false);
      });
  }, []);
  async function handleDelete(id) {
    await axios
      .delete(`/vote`, {
        data: { id },
      })
      .then((response) => {
        console.log(response.data);
      });

    window.location.reload();
  }
  function handleClick(url) {
    window.open(url);
  }
  window.onload = function () {
    const firstCard = document.querySelector('.card');
    console.log(firstCard, 'firstCard');
  };
  return (
    <div className={styles.resultPage}>
      <Header />
      {isReady ? (
        <h1>준비안됨</h1>
      ) : (
        <div className={styles.votes__container}>
          {voteResultList.map((items, index) => (
            <div className={styles.vote__container} key={index}>
              <div className={styles.vote__title}>
                <div className={styles.voteNum}>
                  <span>vote {index + 1}</span>
                </div>
                <div className={styles.message}>
                  <span>{items.room_message}</span>
                  <span>총 투표 수: {items.total_likes}</span>
                </div>

                <div
                  onClick={() => {
                    handleDelete(items._id);
                  }}
                  className={styles.close}
                >
                  삭제
                </div>
              </div>
              <div className="cards">
                {
                  ((tmp = mostLikes[index]),
                  items.products
                    .sort(function (a, b) {
                      return b.likes - a.likes;
                    })
                    .map((result, index) =>
                      tmp == result.likes ? (
                        <>
                          <div
                            onClick={() => {
                              handleClick(result.shop_url);
                            }}
                            className="card winCard"
                            key={index}
                          >
                            <img src={result.img} alt="img" />
                            <span>
                              {Math.round(
                                (result.likes / items.total_likes +
                                  Number.EPSILON) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            onClick={() => {
                              handleClick(result.shop_url);
                            }}
                            className="card"
                            key={index}
                          >
                            <img src={result.img} alt="img" />
                            <span>
                              {Math.round(
                                (result.likes / items.total_likes +
                                  Number.EPSILON) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </>
                      )
                    ))
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoteResult;
