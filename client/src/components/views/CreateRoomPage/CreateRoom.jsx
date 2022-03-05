import React, { useState, Component } from 'react';
import { v1 as uuid } from 'uuid';
import styles from './CreateRoom.module.css';
import Auth from '../../../hoc/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import Cookies from 'universal-cookie';
import Modal from '../../Modal/Modal';
import SimpleSlider from '../../SimpleSlider/SimpleSlider';
// import Slider from "react-slick";

const CreateRoom = (props) => {
  // useState를 사용하여 open상태를 변경한다. (open일때 true로 만들어 열리는 방식)
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  // const [userId, setUserId] = useState('');
  // getUserInfo();
  //장바구니
  const openModal = () => {
    const token = getCookie('x_auth');
    axios
      .get(`/privatebasket/${token}`)
      .then((Response) => {
        setProducts(Response.data);
      })
      .catch((Error) => {
        console.log(Error);
      })
      .then(setModalOpen(true));
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  // 쿠키 받아옴
  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }
  // ID 받아옴
  // function getUserInfo() {
  //   let token = getCookie('x_auth');
  //   axios.post('/api/users/info', { token }).then(function (response) {
  //     console.log(response.data.username, 'getUserInfo');
  //     setUserId(response.data.username);
  //   });
  // }

  // if (getCookie('room')) {
  //   document.location.href = '/invited';
  // }

  function create() {
    const id = uuid();
    const shopWidth = window.screen.width * 0.85;
    const userWidth = window.screen.width * 0.15;

    window.open(
      './chooseshop',
      'shops',
      `width=${shopWidth}, left=${userWidth}, top=0, height=10000, scrollbars=yes, resizable, status=yes, menubar=yes, titlebar=yes`
    );

    window.open(`/room/${id}`, `videochat`, `width=${userWidth}, top=0, left=0, height=10000, scrollbars=yes, resizable=no`, 'target');
    // props.history.push(`/room/${id}`);
  }
  const navigate = useNavigate();
  const logout = () => {
    axios.get('/api/users/logout').then((response) => {
      if (response.data.success) {
        navigate('/');
      }
      navigate('/');
    });
  };

  const deleteAPIWishlistItem = (shop_url) => {
    const token = getCookie('x_auth');
    console.log(token);

    axios
      .delete(`/privatebasket/product`, { data: { token, shop_url } })
      .then(function (response) {
        console.log(response);
        setProducts(products?.filter((product) => product.shop_url !== shop_url));
      })
      .catch(function (error) {
        console.log(error.response);
      });
  };

  const deleteItem = (product) => {
    console.log('create room delete : ', product);
    deleteAPIWishlistItem(product);
  };

  const HandleDressRoomClick = () => {
    const id = uuid();

    navigate(`/dressroom/${id}`);
  };

  const voteResult = () => {
    navigate(`/voteresult`);
  };

  const handlePrivateBasket = () => {
    navigate('/privateBasket');
  };

  return (
    <>
      <Header />
      <div className={styles.createRoom}>
        <div className={styles.title}>
          <p>MOBA에 오신 것을 환영합니다</p>
        </div>
        <SimpleSlider
          handleCody={HandleDressRoomClick}
          handleCart={openModal}
          handleVoteResult={voteResult}
          handleShopping={create}
          handlePrivateBasket={handlePrivateBasket}
        />
        <Modal open={modalOpen} close={closeModal} header="나의 장바구니" products={products} deleteItem={deleteItem} />
      </div>
    </>
  );
};

export default Auth(CreateRoom, true);
