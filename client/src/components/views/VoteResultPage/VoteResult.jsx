import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
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

  return (
    <>
      <h1> 결과 페이지입니다.</h1>;
      <div>
        {voteResultList?.map((items, index) => (
          <div>
            <div>{items.room_message}</div>
            {items.products?.map((result, index) => (
              <div>
                <img src={result.img} alt="img" />
                <h1>투표 결과 : {result.likes}</h1>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default VoteResult;
