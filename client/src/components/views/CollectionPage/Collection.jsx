import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Collection.module.css';
import Cookies from 'universal-cookie';
import NormalHeader from '../../NormalHeader/NormalHeader';
import SimpleSlider from '../../SimpleSlider/SimpleSlider';

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
        for (let collection of user.collections) {
          collection = Object.assign(collection, { name: user.name });
          productImg.push(collection);
        }
      }
      setProductImg(productImg);
    });
    console.log(productImg);
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
        setCollectionImg(collectionImg);
      });
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
    </>
  );
};

export default Collection;
