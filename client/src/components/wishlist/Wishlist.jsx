import React from 'react';
import styles from './Wishlist.module.css';
import Product from './Product';

const WishList = (props) => {
  let products = props.data;

  return (
    <>
      <div className={styles.productContainer}>
        {products.length > 0 ? (
          products.map((item, index) => <Product changeHandler={props.changeHandler} key={index} item={item} deleteItem={props.deleteItem} />)
        ) : (
          <></>
        )}
      </div>
      {/* {products.length > 0 ? <button className={styles.voteBtn}>투표 하기</button> : <></>} */}
    </>
  );
};

export default WishList;
