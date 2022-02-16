import React from "react";
import styles from "./Wishlist.module.css";

const Product = props => {
  const item = props.item;
  console.log("products :", item);
  const onChange = e => {
    props.changeHandler(e.target.checked, item);
  };

  // console.log("product : ", props.item[0]);

  return (
    <div className={styles.productItem}>
      <p className={styles.itemDelete} onClick={() => props.deleteItem(item.shop_url)}>
        X
      </p>
      <div className={styles.productLabel}>{item.shop_name}</div>
      <div className={styles.containerImg} onClick={() => window.open(item.shop_url, "_blank")}>
        <img className={styles.productItemImg} src={item.img} alt="상품 이미지" onClick={() => {}} />
      </div>
      <div className={styles.productItemDetails}>
        <a className={styles.productItemTitle} onClick={() => window.open(item.shop_url, "_blank")}>
          {item.product_name}
        </a>
        <div className={styles.line}></div>
      </div>
      <div className={styles.productFooter}>
        <input className={styles.productCheckbox} type="checkbox" onChange={onChange} />
        <h3 className={styles.productItemPrice}>{item.price}</h3>
      </div>
      {/* <button onClick={() => window.open(item.shop_url, "_blank")}>바로가기</button> */}
    </div>
  );
};

export default Product;
