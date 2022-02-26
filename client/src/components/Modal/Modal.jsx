import React, { useState, useEffect } from 'react';
import Product from '../wishlist/Product';
import './Modal.css';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { v1 as uuid } from 'uuid';

const Modal = (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const { open, close, header, products } = props;
  console.log('__Modal : ', products);

  const [checkedInputs, setCheckedInputs] = useState([]);

  const changeHandler = (checked, id) => {
    if (checked) {
      setCheckedInputs([...checkedInputs, id]);
    } else {
      setCheckedInputs(checkedInputs.filter((el) => el !== id));
    }
    console.log('checkbox :', id);
  };

  useEffect(() => {
    window.Kakao.init('c45ed7c54965b8803ada1b6e2f293f4f');
  }, []);

  const vote = () => {
    function getCookie(name) {
      const cookies = new Cookies();
      return cookies.get(name);
    }
    const token = getCookie('x_auth');

    const id = uuid();

    const shareKakao = () => {
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: '모바',
          description: '골라줘!',
          imageUrl: '#',
          link: {
            webUrl: `http://localhost:3000/vote/${id}`,
          },
        },
        buttons: [
          {
            title: '투표하기로 이동',
            link: {
              webUrl: `http://localhost:3000/vote/${id}`,
            },
          },
        ],
      });
    };

    const sendCheckedProduct = () => {
      axios
        .post('/vote', {
          token: token,
          products: checkedInputs,
          room_info: id,
        })
        .then((Response) => {
          // Response가 정상일때 products에 상품을 추가한다.
          console.log(Response);
          console.log('token입니다. : ', token);
          console.log('products입니다. : ', [checkedInputs]);
          console.log('room_info입니다. : ', id);
        });
    };

    sendCheckedProduct();
    shareKakao();
  };

  return (
    // 모달이 열릴때 openModal 클래스가 생성된다.
    <div className="container">
      <div className={open ? 'openModal modal' : 'modal'}>
        {open ? (
          <section className="section__">
            <header>
              {header}
              <button className="close" onClick={close}>
                {' '}
                &times;{' '}
              </button>
            </header>

            <main className="main">
              {products.length > 0 ? (
                products.map((item, index) => (
                  <Product
                    changeHandler={changeHandler}
                    key={index}
                    item={item}
                    deleteItem={props.deleteItem}
                  />
                ))
              ) : (
                <></>
              )}
            </main>

            <footer>
              <button className="vote" onClick={vote}>
                {' '}
                vote{' '}
              </button>
              <button className="close" onClick={close}>
                {' '}
                close{' '}
              </button>
            </footer>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default Modal;
