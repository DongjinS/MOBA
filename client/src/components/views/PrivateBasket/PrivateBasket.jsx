import React from 'react';
import './PrivateBasket.module.css';

const PrivateBasket = (props) => {
  return (
    <div>
       <h1>개인 장바구니</h1>
        <div className="container">
            <div className="experienceContents">
                <div className="experienceCategory"></div>
                <div className="experienceGrid"></div>
            </div>
        </div>
    </div>
  );
};

export default PrivateBasket;
