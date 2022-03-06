import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Collection.module.css';
import Cookies from 'universal-cookie';
import NormalHeader from '../../NormalHeader/NormalHeader';
import SimpleSlider from '../../SimpleSlider/SimpleSlider';
import { AiFillPlusCircle } from 'react-icons/ai';
import { FiChevronRight } from 'react-icons/fi';
import { VscClose } from 'react-icons/vsc';
const Collection = () => {
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }
  const token = getCookie('x_auth');

  const [othersProductImg, setProductImg] = useState([]);
  const [collectionImg, setCollectionImg] = useState([]);
  const [myCollection, setMyCollection] = useState(false);

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

      let othersProductImg = [];

      for (let othersProducts of productImg) {
        let othersCollectionSet = {
          outer: '',
          top: '',
          bottom: '',
          shoes: '',
        };
        for (let othersProduct of othersProducts) {
          if (othersProduct.category === '아우터') {
            othersCollectionSet.outer = othersProduct;
          } else if (othersProduct.category === '상의') {
            othersCollectionSet.top = othersProduct;
          } else if (othersProduct.category === '하의') {
            othersCollectionSet.bottom = othersProduct;
          } else {
            othersCollectionSet.shoes = othersProduct;
          }
        }
        othersProductImg.push(othersCollectionSet);
      }
      setProductImg(othersProductImg);
      console.log(othersProductImg, '이거 사용하면 됨 혁주야');
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
        console.log(collectionImg, 'collection Img');
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
          <p
            onClick={() => {
              setMyCollection(false);
            }}
            className={myCollection ? styles.normal : styles.selected}
          >
            내 컬렉션
          </p>
          <p
            className={!myCollection ? styles.normal : styles.selected}
            onClick={() => {
              setMyCollection(true);
            }}
          >
            전체 컬렉션
          </p>
        </div>
        {!myCollection ? (
          <div className={styles.sliderBox}>
            <SimpleSlider collectionImg={collectionImg} handleDelete={deleteCollection} />
          </div>
        ) : (
          <div className={styles.otherContainer}>
            {othersProductImg &&
              othersProductImg.map((items, index) => (
                <div key={index} className={styles.collection__card}>
                  {/* <div className={styles.collection__del__box}>
                    <VscClose
                      className={styles.i__collection__del}
                      size={25}
                      onClick={() => {
                        deleteCollection(index);
                      }}
                    />
                  </div> */}
                  <div className={styles.collectionSet}>
                    <img className={styles.collectionImgTop} src={items.top.removedBgImg} alt='img' />
                    <div className={`${styles.con__tooltip} ${styles.bottom}`}>
                      <AiFillPlusCircle className={styles.i__plus} />
                      <div
                        onClick={() => {
                          window.open(items.top.shop_url);
                        }}
                        className={styles.tooltip}
                      >
                        <div className={styles.tooltip__img}>
                          <img width={70} height={70} src={items.top.img} />
                        </div>
                        <div className={styles.tooltip__description}>
                          <span>{items.top.shop_name}</span>
                          <span>{items.top.product_name}</span>
                          <span>{items.top.sale_price && items.top.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                        </div>
                        <div className={styles.tooltip__icon}>
                          <FiChevronRight className={styles.i__right} />
                        </div>
                      </div>
                    </div>
                    <img className={styles.collectionImgBottom} src={items.bottom.removedBgImg} alt='img'></img>
                    <div className={`${styles.con__tooltip} ${styles.bottom} ${styles.con__bottom}`}>
                      <AiFillPlusCircle className={styles.i__plus} />
                      <div
                        onClick={() => {
                          window.open(items.bottom.shop_url);
                        }}
                        className={styles.tooltip}
                      >
                        <div className={styles.tooltip__img}>
                          <img width={70} height={70} src={items.bottom.img} />
                        </div>
                        <div className={styles.tooltip__description}>
                          <span>{items.bottom.shop_name}</span>
                          <span>{items.bottom.product_name}</span>
                          <span>{items.bottom.sale_price && items.bottom.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                        </div>
                        <div className={styles.tooltip__icon}>
                          <FiChevronRight className={styles.i__right} />
                        </div>
                      </div>
                    </div>
                    <img className={styles.collectionImgShoes} src={items.shoes.removedBgImg} alt='img'></img>
                    <div className={`${styles.con__tooltip} ${styles.bottom} ${styles.con__shoes}`}>
                      <AiFillPlusCircle className={styles.i__plus} />
                      <div
                        onClick={() => {
                          window.open(items.shoes.shop_url);
                        }}
                        className={styles.tooltip}
                      >
                        <div className={styles.tooltip__img}>
                          <img width={70} height={70} src={items.shoes.img} />
                        </div>
                        <div className={styles.tooltip__description}>
                          <span>{items.shoes.shop_name}</span>
                          <span>{items.shoes.product_name}</span>
                          <span>{items.shoes.sale_price && items.shoes.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                        </div>
                        <div className={styles.tooltip__icon}>
                          <FiChevronRight className={styles.i__right} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Collection;
