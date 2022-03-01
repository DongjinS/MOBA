import './SimpleSlider.css';
import { useState } from 'react';
import Slider from 'react-slick';

import React from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
function SimpleSlider(props) {
  const NextArrow = ({ onClick }) => {
    return (
      <div className="arrow next" onClick={onClick}>
        <AiOutlineRight className="arrow__i" />
      </div>
    );
  };
  const PrevArrow = ({ onClick }) => {
    return (
      <div className="arrow prev" onClick={onClick}>
        <AiOutlineLeft className="arrow__i" />
      </div>
    );
  };

  const [imageIndex, setImageIndex] = useState(0);

  const settings = {
    infinite: true,
    lazyLoad: true,
    speed: 300,
    slidesToShow: 3,
    centerMode: true,
    centerPadding: 0,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (current, next) => setImageIndex(next),
  };

  return (
    <div className="slider__container">
      <Slider {...settings}>
        <div
          id="first"
          className={0 === imageIndex ? 'slide activeSlide' : 'slide'}
          onClick={() => {
            props.handleCody();
          }}
        >
          <p>코디하기</p>
        </div>
        <div
          id="second"
          className={1 === imageIndex ? 'slide activeSlide' : 'slide'}
          onClick={() => {
            props.handleCart();
          }}
        >
          <p>투표/장바구니</p>
        </div>
        <div
          id="third"
          className={2 === imageIndex ? 'slide activeSlide' : 'slide'}
          onClick={() => {
            props.handleVoteResult();
          }}
        >
          <p>투표결과</p>
        </div>
        <div
          id="fourth"
          className={3 === imageIndex ? 'slide activeSlide' : 'slide'}
          onClick={() => {
            props.handleShopping();
          }}
        >
          <p>쇼핑시작</p>
        </div>

        {/* {titles.map((title, idx) => (
          <div className={idx === imageIndex ? 'slide activeSlide' : 'slide'}>
            <span>{title}</span>
            <span>{idx}</span>
          </div>
        ))} */}
      </Slider>
    </div>
  );
}

export default SimpleSlider;
