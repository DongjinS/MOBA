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

  const [voteProducts, setVoteProducts] = useState();

  const handleProductClick = (e, item) => {
    if (!checked) {
      window.open(item.shop_url);
    } else {
      alert(item.product_name);
      // alert(e.target.classList);
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.experienceContents}>
          <ul className={styles.experienceCategory}>
            <li className={styles.categoryName}>
              <div
                className={checked ? styles.maskText : styles.maskText + ' ' + styles.selected}
                onClick={() => {
                  setChecked(false);
                }}
              >
                <span>장바구니</span>
              </div>
            </li>
            <li className={styles.categoryName}>
              <div
                className={!checked ? styles.maskText : styles.maskText + ' ' + styles.selected}
                onClick={() => {
                  setChecked(true);
                }}
              >
                <span>투표</span>
              </div>
            </li>
          </ul>
          <div className={styles.experienceGrid}>
            <div className={styles.experienceList}>
              {products.map((item, index) => (
                // <a href={item.shop_url} target="_blank">
                <div
                  className={styles.productContainer}
                  onClick={(e) => {
                    handleProductClick(e, item);
                  }}
                >
                  <div className={styles.productImgContainer}>
                    <img className={styles.itemImg} src={item.removedBgImg} />

                    <div className={!checked ? styles.productInfo : styles.voteInfo}>
                      <div style={{ margin: '25% 15%' }}>
                        <span className={styles.shopName}>{item.shop_name}</span>
                        <div className={styles.productName}>{item.product_name}</div>

                        {item.price === item.sale_price ? (
                          <div style={{ marginTop: '40px', fontSize: '20px', fontWeight: '800' }}>
                            {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
                          </div>
                        ) : (
                          <>
                            <div style={{ marginTop: '40px', fontSize: '20px', fontWeight: '600', color: 'grey', textDecoration: 'line-through' }}>
                              {item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#a02226' }}>
                              {item.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                // </a>
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
