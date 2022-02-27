import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Header from '../../header/Header';
import styles from './VoteResult.module.css';
let tmp;
let totalTmp;

const VoteResult = () => {
  const [voteResultList, setVoteResultList] = useState([]);
  window.onload = function () {
    totalTmp = tmp;
    console.log(totalTmp, 'totalTmp');
  };
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

              <div
                onClick={() => {
                  handleDelete(items._id);
                }}
                className={styles.close}
              >
                삭제
              </div>
            </div>
            <div className={styles.cards}>
              {
                (((tmp = 0), totalTmp),
                items.products
                  .sort(function (a, b) {
                    return b.likes - a.likes;
                  })
                  .map(
                    (result, index) => (
                      (tmp += result.likes),
                      (
                        <>
                          <div
                            onClick={() => {
                              handleClick(result.shop_url);
                            }}
                            className={styles.card}
                            key={index}
                          >
                            <img src={result.img} alt="img" />
                            <span>{(result.likes / tmp) * 100}%</span>
                          </div>
                        </>
                      )
                    )
                  ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoteResult;
