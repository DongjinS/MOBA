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

        for (let collectionlist of collectionLists) {
          console.log('------------------셋트 시작------------------');
          let collectionSet = {
            outer: '',
            top: '',
            bottom: '',
            shoes: '',
          };
          for (let collection of collectionlist) {
            if (collection.category === '아우터') {
              collectionSet.outer = collection;
            } else if (collection.category === '상의') {
              collectionSet.top = collection;
            } else if (collection.category === '하의') {
              collectionSet.bottom = collection;
            } else {
              collectionSet.shoes = collection;
            }
          }
          collectionImg.push(collectionSet);
        }
        console.log(collectionImg);
        setCollectionImg(collectionImg);
      });
    console.log(collectionImg);
  }, []);

  return (
    <>
      <h1>콜렉션 페이지</h1>
      <div>
        <h1> 아래는 콜렉션 이미지 입니다. </h1>
        <div className={styles.collectionSets}>
          {collectionImg.map((items, index) => (
            <div>
              <div className={styles.collectionSet}>
                <img
                  className={styles.collectionImgTop}
                  key={index}
                  src={items.top.removedBgImg}
                  alt="img"
                ></img>
                <img
                  className={styles.collectionImgBottom}
                  key={index}
                  src={items.bottom.removedBgImg}
                  alt="img"
                ></img>
                <img
                  className={styles.collectionImgShoes}
                  key={index}
                  src={items.shoes.removedBgImg}
                  alt="img"
                ></img>
              </div>
              <div>
                <img
                  className={styles.collectionSmallImgTop}
                  key={index}
                  src={items.top.removedBgImg}
                  alt="img"
                ></img>
                <img
                  className={styles.collectionSmallImgBottom}
                  key={index}
                  src={items.bottom.removedBgImg}
                  alt="img"
                ></img>
                <img
                  className={styles.collectionSmallImgShoes}
                  key={index}
                  src={items.shoes.removedBgImg}
                  alt="img"
                ></img>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <section className={styles.sectionImg}>
        <article className={styles.articleImg}>
          <div className={styles.imgContainer}>
            <ul className={styles.imgUl}>
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
      </section> */}
    </>
  );
};

export default Collection;
