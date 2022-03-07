import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Collection.module.css';
import Cookies from 'universal-cookie';
import NormalHeader from '../../NormalHeader/NormalHeader';
import SimpleSlider from '../../SimpleSlider/SimpleSlider';
import Auth from '../../../hoc/auth';

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
  async function deleteCollection(index) {
    let collectionImg = [];
    await axios.delete('collection/items', { data: { token, index } }).then((response) => {
      const collectionLists = response.data;
      for (let collectionlist of collectionLists) {
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
  }
  return (
    <>
      <NormalHeader />
      <div className={styles.flexBox}>
        <div className={styles.title}>
          <p>내 컬렉션</p>
          <p>남 컬렉션</p>
        </div>
        <SimpleSlider className={styles.slider} collectionImg={collectionImg} handleDelete={deleteCollection} />
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

export default Auth(Collection, true);
