import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import NormalHeader from '../../NormalHeader/NormalHeader';
import styles from './VoteResult.module.css';
import './VoteResult.css';
import Accordion from '../../Accordion/Accordion';
import { MdHowToVote } from 'react-icons/md';
import Auth from '../../../hoc/auth';

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
        setVoteResultList(voteResultList?.filter((items) => items._id !== id));
      });

    // window.location.reload();
  }
  function handleClick(url) {
    window.open(url);
  }
  window.onload = function () {
    const firstCard = document.querySelector('.card');
  };
  return (
    <>
      <NormalHeader />
      <div className={styles.resultPage}>
        {isReady ? (
          <></>
        ) : (
          <>
            <div className={styles.titles}>
              <div className={styles.title}>
                <p>투표결과</p>
              </div>
            </div>
            <div className={styles.votes__container}>
              {voteResultList.map((items, index) => (
                <div className={styles.vote__container} key={index}>
                  <Accordion
                    voteNum={voteResultList.length - index}
                    title={items.room_message}
                    content={items}
                    mostLikes={mostLikes}
                    index={index}
                    handleDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Auth(VoteResult, true);
