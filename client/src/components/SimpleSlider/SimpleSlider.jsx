import './SimpleSlider.css';
import { useState } from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';

import brandy from '../../images/brandy.png';
import musinsa from '../../images/musinsa.png';
import wconcept from '../../images/wconcept.jpg';

import React from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
const images = [brandy, musinsa, wconcept];

function SimpleSlider() {
  const NextArrow = ({ onClick }) => {
    return (
      <div className="arrow next" onClick={onClick}>
        <FaArrowRight />
      </div>
    );
  };
  const PrevArrow = ({ onClick }) => {
    return (
      <div className="arrow prev" onClick={onClick}>
        <FaArrowLeft />
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
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (current, next) => setImageIndex(next),
  };

  return (
    <div className="slider__container">
      <Slider {...settings}>
        {images.map((img, idx) => (
          <div className={idx === imageIndex ? 'slide activeSlide' : 'slide'}>
            <img src={img} alt={img} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default SimpleSlider;
