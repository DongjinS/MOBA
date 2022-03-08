import './SimpleSlider.css';
import { useState } from 'react';
import Slider from 'react-slick';
import React from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { AiFillPlusCircle } from 'react-icons/ai';
import { FiChevronRight } from 'react-icons/fi';
import { VscClose } from 'react-icons/vsc';
import { Navigate } from 'react-router-dom';

function SimpleSlider(props) {
  const NextArrow = ({ onClick }) => {
    return (
      <div className='arrow next' onClick={onClick}>
        <FaAngleRight className='arrow__i' />
      </div>
    );
  };
  const PrevArrow = ({ onClick }) => {
    return (
      <div className='arrow prev' onClick={onClick}>
        <FaAngleLeft className='arrow__i' />
      </div>
    );
  };

  const [imageIndex, setImageIndex] = useState(0);

  const defaultSettings = {
    infinite: true,
    lazyLoad: true,
    speed: 300,
    slidesToShow: 1,
    centerMode: true,
    centerPadding: 0,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (current, next) => setImageIndex(next),
  };
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
    <div className='slider__container'>
      {props.collectionImg.length > 3 ? (
        <Slider {...settings}>
          {props.collectionImg &&
            props.collectionImg.map((items, index) => (
              <div key={index} className={index === imageIndex ? 'slide activeSlide' : 'slide'}>
                <VscClose
                  onClick={() => {
                    props.handleDelete(index);
                  }}
                  className='i__collection__del'
                  size={25}
                />
                <div className='collectionSet'>
                  <img className='collectionImgTop' src={items.top.removedBgImg} alt='img' />
                  <div className='con-tooltip bottom'>
                    <AiFillPlusCircle className='i__plus' />
                    <div
                      onClick={() => {
                        window.open(items.top.shop_url);
                      }}
                      className='tooltip'
                    >
                      <div className='tooltip__img'>
                        <img width={70} height={70} src={items.top.img} />
                      </div>
                      <div className='tooltip__description'>
                        <span>{items.top.shop_name}</span>
                        <span>{items.top.product_name}</span>
                        <span>{items.top.sale_price && items.top.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                      </div>
                      <div className='tooltip__icon'>
                        <FiChevronRight className='i__right' />
                      </div>
                    </div>
                  </div>
                  <img className='collectionImgBottom' src={items.bottom.removedBgImg} alt='img'></img>
                  <div className='con-tooltip bottom con-bottom'>
                    <AiFillPlusCircle className='i__plus' />
                    <div
                      onClick={() => {
                        window.open(items.bottom.shop_url);
                      }}
                      className='tooltip'
                    >
                      <div className='tooltip__img'>
                        <img width={70} height={70} src={items.bottom.img} />
                      </div>
                      <div className='tooltip__description'>
                        <span>{items.bottom.shop_name}</span>
                        <span>{items.bottom.product_name}</span>
                        <span>{items.bottom.sale_price && items.bottom.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                      </div>
                      <div className='tooltip__icon'>
                        <FiChevronRight className='i__right' />
                      </div>
                    </div>
                  </div>
                  <img className='collectionImgShoes' src={items.shoes.removedBgImg} alt='img'></img>
                  <div className='con-tooltip con-shoes bottom'>
                    <AiFillPlusCircle className='i__plus' />
                    <div
                      onClick={() => {
                        window.open(items.shoes.shop_url);
                      }}
                      className='tooltip'
                    >
                      <div className='tooltip__img'>
                        <img width={70} height={70} src={items.shoes.img} />
                      </div>
                      <div className='tooltip__description'>
                        <span>{items.shoes.shop_name}</span>
                        <span>{items.shoes.product_name}</span>
                        <span>{items.shoes.sale_price && items.shoes.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                      </div>
                      <div className='tooltip__icon'>
                        <FiChevronRight className='i__right' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </Slider>
      ) : (
        <Slider {...defaultSettings}>
          {props.collectionImg &&
            props.collectionImg.map((items, index) => (
              <div key={index} className={index === imageIndex ? 'slide activeSlide' : 'slide'}>
                <VscClose
                  onClick={() => {
                    props.handleDelete(index);
                  }}
                  className='i__collection__del'
                  size={25}
                />
                <div className='collectionSet'>
                  <img className='collectionImgTop' src={items.top.removedBgImg} alt='img' />
                  <div className='con-tooltip bottom'>
                    <AiFillPlusCircle className='i__plus' />
                    <div
                      onClick={() => {
                        window.open(items.top.shop_url);
                      }}
                      className='tooltip'
                    >
                      <div className='tooltip__img'>
                        <img width={70} height={70} src={items.top.img} />
                      </div>
                      <div className='tooltip__description'>
                        <span>{items.top.shop_name}</span>
                        <span>{items.top.product_name}</span>
                        <span>{items.top.sale_price && items.top.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                      </div>
                      <div className='tooltip__icon'>
                        <FiChevronRight className='i__right' />
                      </div>
                    </div>
                  </div>
                  <img className='collectionImgBottom' src={items.bottom.removedBgImg} alt='img'></img>
                  <div className='con-tooltip bottom con-bottom'>
                    <AiFillPlusCircle className='i__plus' />
                    <div
                      onClick={() => {
                        window.open(items.bottom.shop_url);
                      }}
                      className='tooltip'
                    >
                      <div className='tooltip__img'>
                        <img width={70} height={70} src={items.bottom.img} />
                      </div>
                      <div className='tooltip__description'>
                        <span>{items.bottom.shop_name}</span>
                        <span>{items.bottom.product_name}</span>
                        <span>{items.bottom.sale_price && items.bottom.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                      </div>
                      <div className='tooltip__icon'>
                        <FiChevronRight className='i__right' />
                      </div>
                    </div>
                  </div>
                  <img className='collectionImgShoes' src={items.shoes.removedBgImg} alt='img'></img>
                  <div className='con-tooltip con-shoes'>
                    <AiFillPlusCircle className='i__plus' />
                    <div
                      onClick={() => {
                        window.open(items.shoes.shop_url);
                      }}
                      className='tooltip'
                    >
                      <div className='tooltip__img'>
                        <img width={70} height={70} src={items.shoes.img} />
                      </div>
                      <div className='tooltip__description'>
                        <span>{items.shoes.shop_name}</span>
                        <span>{items.shoes.product_name}</span>
                        <span>{items.shoes.sale_price && items.shoes.sale_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
                      </div>
                      <div className='tooltip__icon'>
                        <FiChevronRight className='i__right' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </Slider>
      )}
    </div>
  );
}

export default SimpleSlider;
