import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../_actions/user_action';
import { useNavigate } from 'react-router-dom';
import Auth from '../../../hoc/auth';
import styles from './RegisterPage.module.css';
import Header from '../../header/Header';
import { v1 as uuid } from 'uuid';

function RegisterPage(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [Username, setUsername] = useState('');
  const [Password, setPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [Name, setName] = useState('');
  const [Email, setEmail] = useState('');

  const onUsernameHandler = (event) => {
    setUsername(event.currentTarget.value);
  };
  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  };
  const onConfirmPasswordHandler = (event) => {
    setConfirmPassword(event.currentTarget.value);
  };
  const onNameHandler = (event) => {
    setName(event.currentTarget.value);
  };
  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value);
  };

  // 프로필 이미지 업로드 구현 영역
  const [ImageUrl, setImageUrl] = useState(null);
  const imgRef = useRef();

  // [프로필 이미지를 업로드해주세요] 버튼 클릭 시 실행
  const onClickFileBtn = (e) => {
    imgRef.current.click();
  };
  const onChangeImage = async () => {
    const reader = new FileReader();
    const file = imgRef.current.files[0];

    const target = '/s3Url/' + uuid();
    const S3url = await fetch(target).then((res) => res.json());

    await fetch(S3url.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: file,
    });

    const imageUrl = S3url.url?.split('?')[0];

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImageUrl(imageUrl);
    };
  };
  // 프로필 이미지 업로드 구현 영역

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (Password !== ConfirmPassword) {
      return alert('패스워드와 패스워드 확인이 일치하지 않습니다.');
    }

    let body = {
      username: Username,
      password: Password,
      name: Name,
      email: Email,
      profileImage: ImageUrl,
    };

    dispatch(registerUser(body)).then((response) => {
      console.log(response.payload);
      if (response.payload.success) {
        navigate('/');
      } else {
        alert('회원가입에 실패하였습니다.');
      }
    });
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.loginContents}>
            <div className={styles.loginText}>
              <span>회원가입</span>
            </div>
            <form
              className={styles.loginForm}
              encType="multipart/form-data"
              onSubmit={onSubmitHandler}
            >
              {/* 프로필 이미지 업로드 : 시작 */}
              <input
                style={{ display: 'none' }}
                type="file"
                ref={imgRef}
                onChange={onChangeImage}
              />
              <div
                className={styles.inputs}
                onClick={() => {
                  onClickFileBtn();
                }}
              >
                <img
                  className={styles.uploadImage}
                  src={ImageUrl ? ImageUrl : ''}
                />
                프로필 이미지를 업로드해주세요.
              </div>
              {/* 프로필 이미지 업로드 : 끝 */}

              <input
                autoFocus
                className={styles.inputs}
                type="text"
                value={Username}
                onChange={onUsernameHandler}
                placeholder="아이디"
              />
              <input
                className={styles.inputs}
                type="password"
                value={Password}
                onChange={onPasswordHandler}
                placeholder="비밀번호(5글자 이상)"
              />
              <input
                className={styles.inputs}
                type="password"
                value={ConfirmPassword}
                onChange={onConfirmPasswordHandler}
                placeholder="비밀번호 확인"
              />
              <input
                className={styles.inputs}
                type="text"
                value={Name}
                onChange={onNameHandler}
                placeholder="이름"
              />
              <input
                className={styles.inputs}
                type="email"
                value={Email}
                onChange={onEmailHandler}
                placeholder="이메일 주소"
              />
              <button className={styles.buttons} type="submit">
                회원가입
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export default Auth(RegisterPage, 'register');
