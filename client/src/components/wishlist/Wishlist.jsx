import React, { useEffect, useState } from "react";
import styles from "./Wishlist.module.css";
import Product from "./Product";

const WishList = props => {
  let products = props.data;

  const [checkedInputs, setCheckedInputs] = useState([]);

  const changeHandler = (checked, id) => {
    if (checked) {
      setCheckedInputs([...checkedInputs, id]);
    } else {
      setCheckedInputs(checkedInputs.filter(el => el !== id));
    }
  };
  console.log(checkedInputs);

  const onClickVoteBtn = () => {
    /* 투표하기 만들기*/
  };

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
