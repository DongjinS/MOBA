import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Cookies from 'universal-cookie';
import ClothesLoading from '../../loading/ClothesLoading';

// Fabric JS
import { fabric } from 'fabric';
import { v1 as uuid } from 'uuid';
import { modifyObj, modifyMouse, getPointer, deleteMouse, addImg } from './ReceiveHandler';

// Styles
import styles from './DressRoom.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import { BsCameraVideoFill, BsCameraVideoOffFill, BsPencilFill, BsHandIndexThumb } from 'react-icons/bs';
import { BsFillMicFill, BsFillMicMuteFill, BsTrash } from 'react-icons/bs';
import { GoUnmute, GoMute } from 'react-icons/go';
import { MdAddShoppingCart } from 'react-icons/md';
import { IoTrashOutline } from 'react-icons/io';
import { BsCartPlus } from 'react-icons/bs';
import { FaTrash, FaTrashAlt } from 'react-icons/fa';
import { AiFillPlusCircle } from 'react-icons/ai';
import { ImCross } from 'react-icons/im';
import { BiChevronLeft } from 'react-icons/bi';
import { CgScreen } from 'react-icons/cg';

const DressRoom = (props) => {
  const [canvas, setCanvas] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [products, setProducts] = useState([]);

  const [uniqueShops, setUniqueShops] = useState([]);

  const [initialWidth, setInitialWidth] = useState(0);
  const canvasRef = useRef();
  const videoContainerRef = useRef();

  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  // 얘는 DOM을 지정하는 것 같지 않고 변수설정하는 것 같이 쓰는 모양(useRef는 변수관리 역할도 한다고 함)
  const userStream = useRef();
  const senders = useRef([]);
  const roomID = useParams().roomID;
  const mouseChannel = useRef();
  const itemChannel = useRef();

  const navigate = useNavigate();

  const handleRecievedMouse = (data) => {
    data = JSON.parse(data);
    // data.clientX = data.clientX * canvasRef.current.offsetWidth;
    // data.clientY = data.clientY * canvasRef.current.offsetHeight;
    console.log(canvasRef.current.offsetWidth, data.clientX);
    if (canvasRef.current.offsetWidth - 25 > data.clientX) {
      modifyMouse(data);
    }
    // modifyMouse(data);
  };

  const needCanvas = (canvas, data) => {
    switch (data.order) {
      case 'add':
        addImg(canvas, data);
        break;
      case 'modify':
        modifyObj(canvas, data);
        break;
      case 'delete':
        /*
         * 문제 : img object가 생성되면 uuid를 통해 각 object의 id 값을 지정한다.
         *   HandleDeleteBtn에서 활성 상태인 obj 자체를 webRTC를 통해 전달하여
         *   obj 내의 id를 통해 삭제하고자 했으나 id가 사라졌다.
         * 해결방법 : delete할 data에 id를 key와 value로 직접 넣어주었다.
         * 동진 : object가 JSON.stringfy()를 하면서 데이터가 유실될 가능성에 대해 찾아보자!
         */
        canvas.getObjects().forEach((object) => {
          console.log('data : ', data);
          if (object.id === data.id) {
            console.log('obj : ', object);
            canvas.remove(object);
          }
        });
        break;
      case 'drawing':
        let path = new fabric.Path(data.path.path);
        console.log(path);
        path.set(data.path);
        path.setCoords();
        canvas.add(path);
        break;
      case 'selected':
        canvas.getObjects().forEach((object) => {
          console.log('data : ', data);
          if (object.id === data.id) {
            console.log('obj : ', object);
            object.selectable = false;
          }
        });
        break;
      case 'deselected':
        canvas.getObjects().forEach((object) => {
          console.log('data : ', data);
          if (object.id === data.id) {
            console.log('obj : ', object);
            object.selectable = true;
          }
        });
        break;
      default:
        break;
    }
  };

  const handleRecievedItem = (data) => {
    data = JSON.parse(data);
    console.log('handle item dc message', data);

    setCanvas((canvas) => {
      needCanvas(canvas, data);
      return canvas;
    });
  };

  const getCookie = (name) => {
    const cookies = new Cookies();
    return cookies.get(name);
  };
  const token = getCookie('x_auth');

  const initCanvas = (width, height) =>
    new fabric.Canvas('canvas', {
      width: width,
      height: height,
      backgroundColor: 'white',
      isDrawingMode: false,
    });

  useEffect(async () => {
    console.log('useEffect []');

    const canvasHeight = canvasRef.current.offsetHeight - 1;
    const canvasWidth = canvasRef.current.offsetWidth - 1;
    setInitialWidth(canvasWidth);

    // 개인 장바구니 상품을 가져온 후 로딩 종료
    setCanvas(initCanvas(canvasWidth, canvasHeight));

    await navigator.mediaDevices
      .getUserMedia({ audio: true, video: true }) // 사용자의 media data를 stream으로 받아옴(video, audio)
      .then((stream) => {
        console.log('rtc socket');
        userVideo.current.srcObject = stream; // video player에 그 stream을 설정함
        userStream.current = stream; // userStream이라는 변수에 stream을 담아놓음
        socketRef.current = io.connect('/');
        socketRef.current.emit('join room', roomID); // roomID를 join room을 통해 server로 전달함

        socketRef.current.on('other user', async (userID) => {
          callUser(userID);

          mouseChannel.current = await peerRef.current.createDataChannel('mouse');
          mouseChannel.current.addEventListener('message', (event) => {
            handleRecievedMouse(event.data);
          });

          itemChannel.current = await peerRef.current.createDataChannel('item');
          itemChannel.current.addEventListener('message', (event) => {
            handleRecievedItem(event.data);
          });

          otherUser.current = userID;
        });
        socketRef.current.on('user joined', (userID) => {
          otherUser.current = userID;
        });
        socketRef.current.on('offer', handleRecieveCall);
        socketRef.current.on('answer', handleAnswer);
        socketRef.current.on('ice-candidate', handleNewICECandidateMsg);
        socketRef.current.on('peer-leaving', function (id) {
          deleteMouse(id);
          otherUser.current = '';
          try {
            partnerVideo.current.srcObject.getVideoTracks().forEach((track) => {
              track.stop();
            });
            partnerVideo.current.srcObject = null;
          } catch (error) {}
          peerRef.current.close();
        });
      });

    getPointer();
    setIsLoading(false);
    axios
      .get(`/privatebasket/${token}`)
      .then((Response) => {
        console.log(Response);
        setProducts(Response.data);
        console.log('axios get products :', products);
        console.log('axios get Response :', Response.data);

        let shops = Response.data.reduce((acc, cv) => {
          acc = acc.concat(cv.shop_name);
          return acc;
        }, []);
        setUniqueShops([...new Set(shops)]);
      })
      .catch((Error) => {
        console.log(Error);
      })
      .then(() => {
        setIsLoading(false);
        console.log('products : ', products);
        console.log('uniqueShops : ', uniqueShops);
      });
  }, []);

  useEffect(() => {
    console.log('useEffect canvas');
    if (canvas) {
      canvas.on('selection:cleared', (opt) => {
        console.log('selection:cleared', canvas.getActiveObjects(), opt);
        if (opt.deselected) {
          opt.deselected.forEach((obj) => {
            try {
              itemChannel.current.send(JSON.stringify({ obj: obj, id: obj.id, order: 'deselected' }));
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          });
        }
      });
      canvas.on('selection:created', (opt) => {
        console.log('selection:created', canvas.getActiveObjects(), opt);
        opt.selected.forEach((obj) => {
          try {
            itemChannel.current.send(JSON.stringify({ obj: obj, id: obj.id, order: 'selected' }));
          } catch (error) {
            // 상대 없을 때 send 시 에러
          }
        });
      });
      canvas.on('selection:updated', (opt) => {
        console.log('selection:updated', canvas.getActiveObjects(), opt);
        opt.selected.forEach((obj) => {
          try {
            itemChannel.current.send(JSON.stringify({ obj: obj, id: obj.id, order: 'selected' }));
          } catch (error) {
            // 상대 없을 때 send 시 에러
          }
        });
      });

      canvas.on('before:path:created', (options) => {
        console.log('before path created', options);
      });
      canvas.on('path:created', (options) => {
        console.log('path created', options);
        const data = {
          order: 'drawing',
          path: options.path,
        };
        try {
          itemChannel.current.send(JSON.stringify(data));
        } catch (error) {
          // 상대 없을 때 send 시 에러
        }
      });
      canvas.on('object:modified', (options) => {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
            order: 'modify',
          };
          try {
            itemChannel.current.send(JSON.stringify(modifiedObj));
          } catch (error) {
            // 상대 없을 때 send 시 에러
          }
        }
      });

      canvas.on('object:moving', (options) => {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
            order: 'modify',
          };
          try {
            itemChannel.current.send(JSON.stringify(modifiedObj));
          } catch (error) {
            // 상대 없을 때 send 시 에러
          }
        }
      });

      canvas.on('mouse:move', (options) => {
        const mouseobj = {
          // clientX: options.e.offsetX / canvasRef.current.offsetWidth,
          // clientY: options.e.offsetY / canvasRef.current.offsetHeight,
          clientX: options.e.offsetX,
          clientY: options.e.offsetY,
        };
        /*
        mouseChannel은 마우스 현재 위치 전송을 위한 webRTC 채널이다. 
        다른 유저가 룸에 들어왔을때 초기화되므로 룸에 다른 유저가 없을때는
        send시 error가 발생한다. try catch문을 통해 이를 방지한다. 
        */
        try {
          console.log('dc mouse send', options);
          mouseobj.id = socketRef.current.id;
          mouseChannel.current.send(JSON.stringify(mouseobj));
        } catch (error) {
          // 상대 없을 때 send 시 에러
        }
      });
      canvas.on('mouse:wheel', function (opt) {
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      console.log('canvas socket:', socketRef.current);
    }
  }, [canvas]);

  const HandleAddImgBtn = (e, item, canvi) => {
    e.preventDefault();
    let url;

    console.log('add image', item);

    if (item.removedBgImg) {
      url = item.removedBgImg;
    } else {
      url = item.img;
    }

    new fabric.Image.fromURL(url, (img) => {
      console.log(img);
      console.log('sender', img._element.currentSrc);
      img.set({
        id: uuid(),
        product_info: item,
        borderColor: 'black',
        borderScaleFactor: 9,
        cornerColor: 'orange',
        cornerSize: 12,
        transparentCorners: false,
      });

      console.log('new_img', img);
      const sendObj = {
        obj: img,
        order: 'add',
        id: img.id,
        url: url,
        product_info: item,
      };

      try {
        itemChannel.current.send(JSON.stringify(sendObj));
      } catch (error) {
        console.log(error);
      }

      img.scale(0.75);
      canvi.add(img);
      canvi.renderAll();
    });
  };

  const HandleDeleteCanvasBtn = () => {
    canvas.getActiveObjects().forEach((obj) => {
      console.log('HandleDeleteBtn : ', obj);
      try {
        itemChannel.current.send(JSON.stringify({ obj: obj, id: obj.id, order: 'delete' }));
      } catch (error) {
        // 상대 없을 때 send 시 에러
      }
      canvas.remove(obj);
    });
    canvas.discardActiveObject().renderAll();
  };

  const copyLink = () => {
    let currentUrl = window.document.location.href; //복사 잘됨
    navigator.clipboard.writeText(currentUrl);
    toast.success('초대링크 복사 완료!', {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    const shareKakao = () => {
      window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: '모바',
          description: '친구랑 코디하기',
          imageUrl: '#',
          link: {
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '웹으로 이동',
            link: {
              webUrl: window.location.href,
            },
          },
        ],
      });
    };
    shareKakao();
  };

  // ---------- webTRC video call ----------
  const callUser = (userID) => {
    peerRef.current = createPeer(userID);
    //senders에 넣어준다 - 중요!
    userStream.current.getTracks().forEach((track) => senders.current.push(peerRef.current.addTrack(track, userStream.current)));
  };

  const createPeer = (userID) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.stunprotocol.org',
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com',
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  };

  const handleNegotiationNeededEvent = async (userID) => {
    await peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit('offer', payload);
      })
      .catch((e) => console.log(e));
  };

  const handleRecieveCall = async (incoming) => {
    peerRef.current = createPeer();
    peerRef.current.addEventListener('datachannel', (event) => {
      console.log('event : ', event);
      console.log('event channel: ', event.channel);

      switch (event.channel.label) {
        case 'mouse':
          mouseChannel.current = event.channel;
          mouseChannel.current.addEventListener('message', (event) => {
            handleRecievedMouse(event.data);
          });
          break;
        case 'item':
          itemChannel.current = event.channel;
          itemChannel.current.addEventListener('message', (event) => {
            handleRecievedItem(event.data);
          });
          setCanvas((canvas) => {
            const objects = canvas.getObjects();
            if (objects.length > 0) {
              objects.forEach((obj) => {
                if (obj.id) {
                  let url;
                  if (obj.product_info.removedBgImg) {
                    url = obj.product_info.removedBgImg;
                  } else {
                    url = obj.product_info.img;
                  }
                  const sendObj = {
                    obj: obj,
                    order: 'add',
                    id: obj.id,
                    url: url,
                    product_info: obj.product_info,
                  };
                  itemChannel.current.send(JSON.stringify(sendObj));
                } else {
                  const data = {
                    order: 'drawing',
                    path: obj,
                  };
                  itemChannel.current.send(JSON.stringify(data));
                }
              });
            }
            return canvas;
          });
          break;
        default:
          break;
      }
    });
    const desc = new RTCSessionDescription(incoming.sdp);
    await peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current.getTracks().forEach((track) => senders.current.push(peerRef.current.addTrack(track, userStream.current)));
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit('answer', payload);
      });
  };

  const handleAnswer = (message) => {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleICECandidateEvent = (e) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit('ice-candidate', payload);
    }
  };

  const handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  };

  const handleTrackEvent = (e) => {
    partnerVideo.current.srcObject = e.streams[0];
  };

  const HandleCameraBtnClick = () => {
    isCameraOn ? setIsCameraOn(false) : setIsCameraOn(true);

    userStream.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  const HandleMicBtnClick = () => {
    isMicOn ? setIsMicOn(false) : setIsMicOn(true);

    userStream.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  const HandleSoundBtnClick = () => {
    let partnerVolume = document.querySelector('#muteCtrl');
    if (isSoundOn) {
      setIsSoundOn(false);
      partnerVolume.muted = true;
    } else {
      setIsSoundOn(true);
      partnerVolume.muted = false;
    }
  };

  const HandleAddtoMyCartBtn = () => {
    console.log('HandleAddToMyCartBtn ');

    canvas.getActiveObjects().forEach((obj) => {
      console.log('add to my cart : ', obj);

      axios
        .post(`/privatebasket`, {
          token: token,
          products: [obj.product_info],
        })
        .then((Response) => {
          // Response가 정상일때 products에 상품을 추가한다.
          console.log(Response);
          if (Response.status === 200) {
            setProducts([...products, obj.product_info]);
          }
        });
    });
  };

  const HandleDeleteProductBtn = (shop_url) => {
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

  window.addEventListener('resize', () => {
    setCanvas((canvas) => {
      try {
        canvas.setWidth(canvasRef.current.offsetWidth);
        canvas.setHeight(canvasRef.current.offsetHeight);
        return canvas;
      } catch (error) {
        return canvas;
      }
    });
  });

  /* ----- sidebar ----- */
  const shrinkBtnRef = useRef();
  const [isActive, setIsActive] = useState(true);

  const [smallWidth, setSmallWidth] = useState(0);
  const productSidebarRef = useRef();
  const handleShrinkBtn = () => {
    if (smallWidth === 0) {
      setSmallWidth(canvasRef.current.offsetWidth);
    }
    setIsActive(!isActive);

    if (isActive) {
      canvas.setWidth(document.body.offsetWidth - videoContainerRef.current.offsetWidth - 430);
    } else {
      canvas.setWidth(initialWidth);
    }
  };

  const DrawingFalse = () => {
    canvas.isDrawingMode = false;
  };

  const HandleDrawing = () => {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = 'black';
    canvas.freeDrawingBrush.width = 5;
  };

  const mobaOnClickHandler = () => {
    navigate('/');
  };

  /* ------ */

  function shareScreen() {
    navigator.mediaDevices
      .getDisplayMedia({ cursor: true })
      .then((stream) => {
        window.resizeTo(window.screen.availWidth * 0.15, window.screen.availHeight);

        const screenTrack = stream.getTracks()[0];
        //face를 screen으로 바꿔줌
        senders.current.find((sender) => sender.track.kind === 'video').replaceTrack(screenTrack);
        //크롬에서 사용자가 공유중지를 누르면, screen을 face로 다시 바꿔줌
        screenTrack.onended = function () {
          senders.current.find((sender) => sender.track.kind === 'video').replaceTrack(userStream.current.getTracks()[1]);
        };
      })
      .catch(() => {
        window.resizeTo(window.screen.availWidth * 0.15, window.screen.availHeight);
      });
  }

  /* ------ */

  return (
    <>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <ClothesLoading />
        </div>
      ) : (
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.logo}>
              {/* <div>모바 LOGO 자리</div> */}
              <button onClick={mobaOnClickHandler} className={styles.title}>
                MOBA
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/images/logo_clothes.png" alt="모바 로고"></img>
              <div style={{ fontSize: '25px', margin: '10px' }}>ㅁㅁㅁ 님의 코디룸</div>
            </div>
            <button className={styles.copyBtn} onClick={copyLink}>
              초대링크 복사하기
            </button>
            {/* <div>공유하기 혹은 추출하기가 들어갈 자리</div> */}
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div className={isActive ? styles.shrink + ' ' + styles.body : styles.body}>
              <div ref={productSidebarRef} className={styles.ProductSidebar}>
                <div className={styles.sidebarTop}>
                  {/* <div className={styles.shrinkBtn} ref={shrinkBtnRef} onClick={handleShrinkBtn}> */}
                  <div ref={shrinkBtnRef} onClick={handleShrinkBtn}>
                    <BiChevronLeft className={styles.chevronIcon} size="40" />
                  </div>
                </div>

                <div className={styles.sidebarLinks}>
                  <ul className={styles.productLists}>
                    {products.map((item, index) => (
                      <div className={styles.tooltipElement} key={index}>
                        <div className={styles.productBox}>
                          <img onClick={(e) => HandleAddImgBtn(e, item, canvas)} className={styles.newProductImg} src={item.img} alt="상품 이미지" />
                          <AiFillPlusCircle onClick={(e) => HandleAddImgBtn(e, item, canvas)} className={styles.addProductIcon} color="orange" size="50" />
                          <div className={styles.hide + ' ' + styles.info}>
                            <ImCross onClick={(e) => HandleDeleteProductBtn(item.shop_url)} className={styles.removeProductIcon} />
                            <div>
                              <span className={styles.shopName}>{item.shop_name}</span>
                              <div className={styles.productName}>{item.product_name}</div>
                            </div>
                            <div className={styles.price}>{item.price}원</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
              </div>

              <div ref={canvasRef} className={styles.canvasContainer}>
                <div className={styles.toolbar}>
                  <button type="button" className={styles.toolbarBtn} name="delete" onClick={HandleDeleteCanvasBtn}>
                    <BsTrash size="30" />
                  </button>
                  <button className={styles.toolbarBtn} onClick={HandleAddtoMyCartBtn}>
                    <MdAddShoppingCart size="30" />
                  </button>
                  <button className={styles.toolbarBtn} onClick={DrawingFalse}>
                    <BsHandIndexThumb size="30" />
                  </button>
                  <button className={styles.toolbarBtn} onClick={HandleDrawing}>
                    <BsPencilFill size="30" />
                  </button>
                </div>
                <ToastContainer
                  position="bottom-center"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <div id="pointers" className={styles.pointers}></div>
                <canvas className={styles.canvas} id="canvas"></canvas>
              </div>
            </div>
          </div>

          <div ref={videoContainerRef} className={styles.sidebarB}>
            <div className={styles.video_container}>
              <div className={styles.user1}>
                <video autoPlay ref={userVideo} className={styles.video} muted="muted" poster="/images/user1.png">
                  video 1
                </video>
                <div className={styles.control_box1}>
                  <button className={styles.controlBtn} onClick={shareScreen}>
                    <CgScreen />
                  </button>
                  <button className={(styles.cameraBtn, styles.controlBtn)} onClick={HandleCameraBtnClick}>
                    {isCameraOn ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}
                  </button>
                  <button className={(styles.micBtn, styles.controlBtn)} onClick={HandleMicBtnClick}>
                    {isMicOn ? <BsFillMicFill /> : <BsFillMicMuteFill />}
                  </button>
                  <button className={(styles.muteBtn, styles.controlBtn)} onClick={HandleSoundBtnClick}>
                    {isSoundOn ? <GoUnmute /> : <GoMute />}
                  </button>
                </div>
              </div>
              <video id="muteCtrl" autoPlay ref={partnerVideo} className={styles.video} poster="/images/user1.png">
                video 2
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DressRoom;
