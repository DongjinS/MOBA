import React, { useState } from 'react';
import './Accordion.css';
import { BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';
import { RiCloseLine } from 'react-icons/ri';
// import { BiCrown } from 'react-icons/bi';
// import { FaCrown } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import { RiVipCrown2Fill } from 'react-icons/ri';

const Accordion = ({ title, content, mostLikes, index, handleDelete }) => {
  const [isActive, setIsActive] = useState(false);
  let tmp;
  function handleClick(url) {
    window.open(url);
  }
  window.onload = () => {
    document.querySelector('.accordion-title').click();
  };
  return (
    <div className="accordion-item">
      <div className="accordion-title" onClick={() => setIsActive(!isActive)}>
        <span>
          <span className="i__active">
            {isActive ? <BsCaretUpFill /> : <BsCaretDownFill />}
          </span>
          {title}
        </span>
        <RiCloseLine
          onClick={() => {
            handleDelete(content._id);
          }}
          className="i__delete"
        />
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
                  tmp !== 0 && tmp == result.likes ? (
                    <>
                      <div
                        onClick={() => {
                          handleClick(result.shop_url);
                        }}
                        className="card winCard"
                        key={index}
                      >
                        <span>
                          <RiVipCrown2Fill className="i__crown" />
                        </span>
                        <span className="voteRank">1등</span>
                        <img
                          className="imgCtrl"
                          src={
                            result.removedBgImg !== undefined
                              ? result.removedBgImg
                              : result.img
                          }
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
                        <span className="voteRank">{index + 1}등</span>
                        <img
                          className="imgCtrl"
                          src={
                            result.removedBgImg !== undefined
                              ? result.removedBgImg
                              : result.img
                          }
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
