import React from 'react';
import styles from './ChooseShop.module.css';
import Header from '../../header/Header';

const ChooseShop = (props) => {
  function OnClickHandler(event) {
    switch (event.target.id) {
      case 'musinsa':
        return (document.location.href = 'https://www.musinsa.com/app/');
      case 'wConcept':
        return (document.location.href = 'https://www.wconcept.co.kr/');
      case 'brandy':
        return (document.location.href = 'https://www.brandi.co.kr/');
      default:
        return (document.location.href = '#');
    }
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.description}>
          <p>모바</p>
          <span>쇼핑몰을 선택하세요</span>
        </div>
        <div className={styles.shopsBox}>
          <button className={styles.shopsBtn}>
            <img
              id="musinsa"
              className={styles.img}
              src="./images/musinsa.png"
              width="100"
              height="100"
              alt="musinsa-logo"
              onClick={OnClickHandler}
            />
          </button>
          <button className={styles.shopsBtn}>
            <img
              id="wConcept"
              className={styles.img}
              src="./images/wconcept.jpg"
              width="100"
              height="100"
              alt="wconcept-logo"
              onClick={OnClickHandler}
            />
          </button>
          <button className={styles.shopsBtn} onClick={OnClickHandler}>
            <img
              id="brandy"
              className={styles.img}
              src="./images/brandy.png"
              width="100"
              height="100"
              alt="brandy-logo"
              onClick={OnClickHandler}
            />
          </button>
          <button
            id="addshops"
            className={styles.shopsBtn}
            id={styles.addBtn}
            onClick={OnClickHandler}
          >
            <i className="fa-solid fa-plus fa-3x"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChooseShop;
