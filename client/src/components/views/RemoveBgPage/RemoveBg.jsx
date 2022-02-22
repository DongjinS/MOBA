import React, { useRef } from 'react';
import styles from './RemoveBg.module.css';
const RemoveBg = (props) => {
  // 이미지가 load 된 후에 select 하기위함
  window.onload = function () {
    const canvas = document.querySelector('#myCanvas');
    const originalImg = document.querySelector('.img__original');
    console.log(originalImg, '못갖고옴');
    canvas.height = originalImg.height;
    canvas.width = originalImg.width;

    // canvas에 이미지 복제
    let ctx = canvas.getContext('2d');
    ctx.drawImage(originalImg, 0, 0);

    // 복제된 이미지에 대한 pixel정보 가져옴
    let id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // 픽셀 순회
    for (var i = 0; i < id.data.length; i += 4) {
      if (id.data[i] == 255 && id.data[i + 1] == 255 && id.data[i + 2] == 255) {
        id.data[i] = 0;
        id.data[i + 1] = 0;
        id.data[i + 2] = 0;
        id.data[i + 3] = 0;
      }
    }
    ctx.putImageData(id, 0, 0);
  };

  return (
    <div className={styles.container}>
      <img src="./images/removeBg/test.jpg" className="img__original" />
      <h1>RemoveBackground Page</h1>
      <canvas id="myCanvas"></canvas>
    </div>
  );
};

export default RemoveBg;
