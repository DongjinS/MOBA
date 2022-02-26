import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useHistory, useParams, useNavigate } from 'react-router-dom';
import { parse } from 'qs';
import styles from './Vote.module.css';

let roomMessage;
const Vote = () => {
  const [products, setProducts] = useState([]);

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
      .then(() => window.location.reload());
  }

  return (
    <>
      <h1>{roomMessage}</h1>

      <div className={styles.myBasket}>
        {products?.map((items, index) => (
          <div key={index} className="container">
            <img src={items.img} alt="img" />
            <p>
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
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Vote;
