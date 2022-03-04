import React, { useState, useEffect } from 'react';
import styles from './PrivateBasket.module.css';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Header from '../../header/Header';

const PrivateBasket = (props) => {
  const [products, setProducts] = useState([]);
  const [checked, setChecked] = useState(false);

  const getCookie = (name) => {
    const cookies = new Cookies();
    return cookies.get(name);
  };
  const token = getCookie('x_auth');

  useEffect(() => {
    axios
      .get(`/privatebasket/${token}`)
      .then((Response) => {
        console.log('token : ', token);
        console.log('response data : ', Response.data);
        setProducts(Response.data.reverse());
      })
      .catch((Error) => {
        console.log(Error);
      })
      .then(() => {});
  }, []);

  console.log('products: ', products);

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.experienceContents}>
          <ul className={styles.experienceCategory}>
            <li className={styles.categoryName}>
              <div className={styles.maskText}>
                <span>장바구니</span>
              </div>
            </li>
            <li className={styles.categoryName}>
              <div className={styles.maskText}>
                <span>투표</span>
              </div>
            </li>
          </ul>
          <div className={styles.experienceGrid}>
            <div className={styles.experienceList}>
              {products.map((item, index) => (
                <div className={styles.experienceItem}>
                  <a className={styles.itemLink}>
                    <div className={styles.itemFrame}>
                      <div className={styles.itemDimd}></div>
                      <div className={styles.itemVisual}>
                        <div className={styles.imageBox}>
                          <img />
                        </div>
                        <div className={styles.hoverBox}>
                          <img className={styles.itemImg} src={item.removedBgImg} />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.experienceLoading}></div>
        </div>
      </div>
    </div>
  );
};

export default PrivateBasket;
