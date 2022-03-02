import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Header from '../../header/Header';
import styles from './VoteResult.module.css';
import './VoteResult.css';
import { RiCloseLine } from 'react-icons/ri';
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
        setVoteResultList(response.data.reverse());
        for (var result of response.data) {
          let maxLike = -1;
          for (var itemResult of result.products) {
            if (maxLike < itemResult.likes) {
              maxLike = itemResult.likes;
            }
          }
          mostLikes.push(maxLike);
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
    <>
      <Header />
      <div className={styles.resultPage}>
        {isReady ? (
          <h1>준비안됨</h1>
        ) : (
          <div className={styles.votes__container}>
            {voteResultList.map((items, index) => (
              <div className={styles.vote__container} key={index}>
                <div className={styles.vote__title}>
                  <div className={styles.voteNum}>
                    <span className={styles.vote__number}>
                      vote {voteResultList.length - index}
                    </span>
                  </div>
                  <div className={styles.message}>
                    <span>{items.room_message}</span>
                    <span>총 투표 수: {items.total_likes}</span>
                  </div>

                  <div className={styles.close}>
                    <RiCloseLine
                      onClick={() => {
                        handleDelete(items._id);
                      }}
                      className={styles.i__close}
                    />
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
    </>
  );
};

export default VoteResult;
