import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Collection.module.css';
import Cookies from 'universal-cookie';

const Collection = () => {
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }
  const token = getCookie('x_auth');

  const [productImg, setProductImg] = useState([]);
  const [collectionImg, setCollectionImg] = useState([]);

  useEffect(async () => {
    let productImg = [];
    await axios.get('/collection').then((response) => {
      const users = response.data;
      console.log(users);

      for (let user of users) {
        for (let product of user.products) {
          productImg.push(product.img);
        }
      }
      setProductImg(productImg);
    });
  }, []);

  useEffect(async () => {
    let collectionImg = [];
    await axios
      .post('/collection', {
        token: token,
      })
      .then((response) => {
        const collectionLists = response.data;
        console.log(collectionLists);

        // for (let user of users) {
        //   for (let product of user.products) {
        //     productImg.push(product.img);
        //   }
        // }
        // setProductImg(productImg);
      });
  }, []);

  return (
    <>
      <h1>콜렉션 페이지</h1>
      <div>여기는 콜렉션 이미지가 들어갑니다.</div>
      <section>
        <article>
          <div>
            <ul>
              {productImg.map((item, index) => (
                <img
                  key={index}
                  className={styles.itemImg}
                  src={item}
                  alt="img"
                ></img>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </>
  );
};

export default Collection;
