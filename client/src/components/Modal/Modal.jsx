import React, { useState } from 'react';
import Product from '../wishlist/Product';
import './Modal.css';

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
