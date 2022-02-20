import React, { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";
import { v1 as uuid } from "uuid";
import io from "socket.io-client";
import { useHistory, useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Cookies from "universal-cookie";
import {
  emitMouse,
  emitModify,
  emitAdd,
  modifyObj,
  addObj,
  modifyMouse,
  getPointer,
  socketConnect,
  deleteMouse,
} from "./socket";

import styles from "./DressRoom.module.css";

import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
import { GoUnmute, GoMute } from "react-icons/go";
import ClothesLoading from "../../loading/ClothesLoading";

const DressRoom = props => {
  const [canvas, setCanvas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const canvasRef = useRef();
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  // 얘는 DOM을 지정하는 것 같지 않고 변수설정하는 것 같이 쓰는 모양(useRef는 변수관리 역할도 한다고 함)
  const userStream = useRef();
  const senders = useRef([]);
  const roomID = useParams().roomID;
  let socket;
  let flag = true;
  if (flag){
    flag = false;
    console.log("try connect")
    socket = socketConnect();
    socketRef.current = socket;
  }

  function getCookie(name) {
    const cookies = new Cookies();
    return cookies.get(name);
  }
  const token = getCookie("x_auth");

  const initCanvas = (width, height) =>
    new fabric.Canvas("canvas", {
      width: width,
      height: height,
      backgroundColor: "pink",
    });

  useEffect(() => {
    // setIsLoading(true);
    const canvasWidth = canvasRef.current.offsetWidth;
    const canvasHeight = canvasRef.current.offsetHeight;

    // 개인 장바구니 상품을 가져온 후 로딩 종료

    setCanvas(initCanvas(canvasWidth, canvasHeight));
    getPointer();

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true }) // 사용자의 media data를 stream으로 받아옴(video, audio)
      .then((stream) => {
        console.log("rtc socket");
        userVideo.current.srcObject = stream; // video player에 그 stream을 설정함
        userStream.current = stream; // userStream이라는 변수에 stream을 담아놓음
        // socketRef.current = io.connect("/");
        socketRef.current.emit("join room", roomID); // roomID를 join room을 통해 server로 전달함
        socketRef.current.on("other user", (userID) => {
          callUser(userID);
          otherUser.current = userID;
        });
        socketRef.current.on("user joined", (userID) => {
          otherUser.current = userID;
        });
        socketRef.current.on("offer", handleRecieveCall);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
      });

    setIsLoading(false);
    axios
      .get(`/privatebasket/${token}`)
      .then(Response => {
        console.log(Response);
        setProducts(Response.data);
      })
      .catch(Error => {
        console.log(Error);
      })
      .then(() => {
        setIsLoading(false);
      });
  }, []);
  
  useEffect(() => {
    // if (flag){
    //   flag = false;
    //   console.log("try connect")
    //   socket = socketConnect();
    // }
    if (canvas) {
      canvas.on("object:modified", function (options) {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
          };
          emitModify(modifiedObj, socket);
        }
      });

      canvas.on("object:moving", function (options) {
        if (options.target) {
          const modifiedObj = {
            obj: options.target,
            id: options.target.id,
          };
          emitModify(modifiedObj, socket);
        }
      });

      canvas.on("mouse:move", function (options) {
        const mouseobj = {
          clientX: options.e.clientX,
          clientY: options.e.clientY,
        };
        emitMouse(mouseobj, socket);
      });

      console.log("canvas socket:", socket);
      modifyObj(canvas, socket);
      addObj(canvas, socket);
      modifyMouse(canvas, socket);
    }
  }, [canvas]);

  const addShape = (e) => {
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
    emitAdd({ obj: object, id: object.id }, socket);
    canvas.renderAll();
  };

  const addImg = (e, url, canvi) => {
    e.preventDefault();
    new fabric.Image.fromURL(url, (img) => {
      console.log(img);
      console.log("sender", img._element.currentSrc);
      img.set({ id: uuid() });
      emitAdd(
        { obj: img, id: img.id, url: img._element.currentSrc },
        socket
      );
      img.scale(0.75);
      canvi.add(img);
      canvi.renderAll();
    });
  };

  const deleteShape = () => {
    console.log(
      canvas.getActiveObjects().forEach((obj) => {
        canvas.remove(obj);
      })
    );
    // canvas.discardActiveObject().renderAll();
  };

  function copyLink() {
    let currentUrl = window.document.location.href; //복사 잘됨
    navigator.clipboard.writeText(currentUrl);
    toast.success("초대링크 복사 완료!", {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  // ---------- webTRC video call ----------
  function callUser(userID) {
    peerRef.current = createPeer(userID);
    //senders에 넣어준다 - 중요!
    userStream.current
      .getTracks()
      .forEach((track) =>
        senders.current.push(
          peerRef.current.addTrack(track, userStream.current)
        )
      );
  }

  function createPeer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }

  function handleNegotiationNeededEvent(userID) {
    peerRef.current
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
        socketRef.current.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  }

  function handleRecieveCall(incoming) {
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          .getTracks()
          .forEach((track) =>
            senders.current.push(
              peerRef.current.addTrack(track, userStream.current)
            )
          );
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
        socketRef.current.emit("answer", payload);
      });
  }

  function handleAnswer(message) {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit("ice-candidate", payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  }

  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
  }

  // socketRef.current.on("clientdisconnect", function (id) {
  //   deleteMouse(id);
  // });

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
              <div>모바 LOGO 자리</div>
              <div> , ToolBox 자리 (그림 그림기, 사물 등)</div>
            </div>
            <div>내 닉네임 / 방번호가 들어갈 자리</div>
            <div>공유하기 혹은 추출하기가 들어갈 자리</div>
          </header>
          <div className={styles.toolbar}>
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
            <button className={styles.copyBtn} onClick={copyLink}>
              초대링크 복사
            </button>
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
          </div>
          {/* 나의 위시리스트에 있는 상품정보 받아서 리스팅한다. */}
          <div className={styles.sidebarA}>
            <div className={styles.bodyContainer}>
              <div className={styles.wishlist}>
                {products.map((item, index) => (
                  <div key={index} className={styles.containerProduct}>
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
            </div>
          </div>
          <div ref={canvasRef} className={styles.main}>
            <div id="pointers"></div>
            <canvas className={styles.canvas} id="canvas" />
          </div>
          <div className={styles.sidebarB}>
            <div className={styles.video_container}>
              <div className={styles.user1}>
                <video autoPlay ref={userVideo} className={styles.video1}>
                  video 1
                </video>
                <div className={styles.control_box1}>
                  <button className={(styles.cameraBtn, styles.controlBtn)}>
                    <BsCameraVideoFill className={styles.icon} />
                  </button>
                  <button className={(styles.micBtn, styles.controlBtn)}>
                    <BsFillMicFill />
                  </button>
                  <button className={(styles.muteBtn, styles.controlBtn)}>
                    <GoUnmute />
                  </button>
                </div>
              </div>
              <video autoPlay ref={partnerVideo} className={styles.video2}>
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
