import React, { useEffect, useState } from "react";
import { fabric } from "fabric";
import { v1 as uuid } from "uuid";
import { emitMouse, emitModify, emitAdd, modifyObj, addObj, modifyMouse } from "./socket";

import styles from "./DressRoom.module.css";

const DressRoom = props => {
  const [canvas, setCanvas] = useState("");
  const [imgURL, setImgURL] = useState("");

  const items = [
    {
      product_name: "에어조던1 미드 멘즈 레드 화이트 BQ6472-161",
      price: 269000,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/2335533",
      img: "https://image.msscdn.net/images/goods_img/20220127/2335533/2335533_1_500.jpg",
    },
    {
      product_name: "갤럭시 워치4 골프 에디션 44mm 블랙",
      price: 329000,
      sale_price: 329000,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/2341273",
      img: "https://image.msscdn.net/images/goods_img/20220204/2341273/2341273_1_500.jpg",
    },
    {
      product_name: "NM2DM51A_빅샷",
      price: 140000,
      sale_price: 126000,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/1034480",
      img: "https://image.msscdn.net/images/goods_img/20190503/1034480/1034480_5_500.jpg",
    },
    {
      product_name: "21AW Santiago Doublecloth Pants (Black)",
      price: 128000,
      sale_price: 128000,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/2182569",
      img: "https://image.msscdn.net/images/goods_img/20211018/2182569/2182569_1_500.jpg",
    },
    {
      product_name: "코트바로우 로우 2 GS BQ5448-104",
      price: 97900,
      sale_price: 97900,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/2089629",
      img: "https://image.msscdn.net/images/goods_img/20210826/2089629/2089629_1_500.jpg",
    },
    {
      product_name: "M Logo 볼마커 & 볼캡 SET GREEN",
      price: 129000,
      sale_price: 129000,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/2341997",
      img: "https://image.msscdn.net/images/goods_img/20220204/2341997/2341997_1_500.jpg",
    },
    {
      product_name: "(22ALL) 2 TONE ARCH HOODIE GRAY",
      price: 79000,
      sale_price: 39500,
      shop_name: "Musinsa",
      shop_url: "https://store.musinsa.com/app/goods/1628385?loc=goods_rank",
      img: "https://image.msscdn.net/images/goods_img/20200928/1628385/1628385_5_500.jpg",
    },
  ];

  const initCanvas = () =>
    new fabric.Canvas("canvas", {
      width: 750,
      height: 700,
      // height: window.screen.availWidth,
      // width: window.screen.availWidth / 2,
      backgroundColor: "pink",
    });

  useEffect(() => {
    setCanvas(initCanvas());
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.on("object:modified", function (options) {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
          };
          emitModify(modifiedObj);
        }
      });

      canvas.on("object:moving", function (options) {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
          };
          emitModify(modifiedObj);
        }
      });

      canvas.on('mouse:move', function(options) {
        const mouseobj = {
          clientX: options.e.clientX, 
          clientY: options.e.clientY
        }
        emitMouse(mouseobj);
      });

      modifyObj(canvas);
      addObj(canvas);
      modifyMouse(canvas);
    }
  }, [canvas]);


  const addShape = e => {
    let type = e.target.name;
    let object;

    if (type === "rectangle") {
      object = new fabric.Rect({
        height: 75,
        width: 150,
      });
    } else if (type === "triangle") {
      object = new fabric.Triangle({
        width: 100,
        height: 100,
      });
    } else if (type === "circle") {
      object = new fabric.Circle({
        radius: 50,
      });
    }

    object.set({ id: uuid() });
    canvas.add(object);
    console.log(object);
    emitAdd({ obj: object, id: object.id });
    canvas.renderAll();
  };

  const addImg = (e, url, canvi) => {
    e.preventDefault();
    new fabric.Image.fromURL(url, (img) => {
      console.log(img);
      console.log("sender", img._element.currentSrc);
      img.set({ id: uuid() });
      emitAdd({ obj: img, id: img.id , url: img._element.currentSrc});
      img.scale(0.75);
      canvi.add(img);
      canvi.renderAll();
      setImgURL("");
    });
  };

  const deleteShape = () => {
    console.log(
      canvas.getActiveObjects().forEach(obj => {
        canvas.remove(obj);
      })
    );
    // canvas.discardActiveObject().renderAll();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.toolbar}>
          <div>모바 LOGO 자리</div>
          <div> , ToolBox 자리 (그림 그림기, 사물 등)</div>
        </div>
        <div>내 닉네임 / 방번호가 들어갈 자리</div>
        <div>공유하기 혹은 추출하기가 들어갈 자리</div>
      </header>

      <div>
        <div>
          <button type="button" name="rectangle" onClick={addShape}>
            Add a Rectangle
          </button>

          <button type="button" name="triangle" onClick={addShape}>
            Add a Triangle
          </button>

          <button type="button" name="circle" onClick={addShape}>
            Add a Circle
          </button>

          <button type="button" name="delete" onClick={deleteShape}>
            삭제하기
          </button>
        </div>
        <div>
          <form onSubmit={e => addImg(e, imgURL, canvas)}>
            <div>
              <input type="text" value={imgURL} onChange={e => setImgURL(e.target.value)} />
              <button type="submit">Add Image</button>
            </div>
          </form>
        </div>

        {/* 나의 위시리스트에 있는 상품정보 받아서 리스팅한다. */}

        <div className={styles.bodyContainer}>
          <div className={styles.wishlist}>
            {items.map((item, index) => (
              <div className={styles.containerProduct}>
                <div className={styles.producctInfo}>
                  <div className={styles.containerImg}>
                    <img className={styles.productImg} src={item.img} alt="상품 이미지" />
                  </div>
                  <div className={styles.productTitle}>{item.product_name}</div>
                </div>
                <div>
                  <button className={styles.productAddbtn} type="button" onClick={e => addImg(e, item.img, canvas)}>
                    추가
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <canvas className={styles.canvas} id="canvas" />
          </div>

          <div className={styles.body}>
            <div className={styles.video1}>video 1</div>
            <div className={styles.video2}>video 2</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DressRoom;
