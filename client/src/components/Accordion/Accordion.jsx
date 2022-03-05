import React, { useState } from 'react';
import './Accordion.css';
import { BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';
const Accordion = ({ title, content, mostLikes, index, voteNum }) => {
  const [isActive, setIsActive] = useState(false);
  let tmp;
  function handleClick(url) {
    window.open(url);
  }
  return (
    <div className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <span>
          vote{voteNum} {title}
        </span>
        <span className="i__active">
          {isActive ? <BsCaretUpFill /> : <BsCaretDownFill />}
        </span>
      </div>
      {isActive && (
        <div className="accordion-content">
          <div className="cards">
            {
              ((tmp = mostLikes[index]),
              content.products
                .sort(function (a, b) {
                  return b.likes - a.likes;
                })
                ?.map((result, index) =>
                  tmp == result.likes ? (
                    <>
                      <div
                        onClick={() => {
                          handleClick(result.shop_url);
                        }}
                        className="card winCard"
                        key={index}
                      >
                        <img
                          className="imgCtrl"
                          src={result.removedBgImg}
                          alt="img"
                        />
                        <div className="productInfo">
                          {/* <span className="product_shop">
                            {result.shop_name}
                          </span>
                          <span className="product_name">
                            {result.product_name}
                          </span>
                          <span className="price">{result.price}원</span> */}
                          <span className="percent">
                            {content.total_likes &&
                              Math.round(
                                (result.likes / content.total_likes +
                                  Number.EPSILON) *
                                  100
                              )}
                            %
                          </span>
                          <span className="voteNums">{result.likes}표</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => {
                          handleClick(result.shop_url);
                        }}
                        className="card"
                        key={index}
                      >
                        <img
                          className="imgCtrl"
                          src={result.removedBgImg}
                          alt="img"
                        />
                        <div className="productInfo">
                          {/* <span className="product_shop">
                            {result.shop_name}
                          </span>
                          <span className="product_name">
                            {result.product_name}
                          </span>
                          <span className="price">{result.price}원</span> */}
                          <span className="percent">
                            {content.total_likes &&
                              Math.round(
                                (result.likes / content.total_likes +
                                  Number.EPSILON) *
                                  100
                              )}
                            %
                          </span>
                          <span className="voteNums">{result.likes}표</span>
                        </div>
                      </div>
                    </>
                  )
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Accordion;
