import React, { useState, useEffect } from 'react';
import styles from './PrivateBasket.module.css';
import Cookies from 'universal-cookie';
import axios from 'axios';

const PrivateBasket = (props) => {
  const [token, setToken] = useState();
  const [products, setProducts] = useState();

  const getCookie = (name) => {
    const cookies = new Cookies();
    return cookies.get(name);
  };

  useEffect(() => {
    setToken(getCookie('x_auth'));
    axios
      .get(`/privatebasket/${token}`)
      .then((Response) => {
        console.log('token : ', token);
        console.log(Response.data);
        setProducts(Response.data.reverse());
      })
      .catch((Error) => {
        console.log(Error);
      })
      .then(() => {
        console.log('products : ', products);
      });
  }, []);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.experienceContents}>
          <ul className={styles.experienceCategory}>
            <li className={styles.categoryName}>
              <div className={styles.maskTest}>
                <span>장바구니</span>
              </div>
            </li>
            <li className={styles.categoryName}>
              <div className={styles.maskTest}>
                <span>투표</span>
              </div>
            </li>
          </ul>
          <div className={styles.experienceGrid}>
            <div className={styles.experienceList}>
              <div className={styles.experienceItem}>
                <a className={styles.itemLink}>
                  <div className={styles.itemFrame}>
                    <div className={styles.itemDimd}></div>
                    <div className={styles.itemVisual}>
                      <div className={styles.imageBox}>
                        <img />
                      </div>
                      <div className={styles.hoverBox}>
                        <img />
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className={styles.experienceLoading}></div>
        </div>
      </div>
    </div>
  );
};

export default PrivateBasket;
