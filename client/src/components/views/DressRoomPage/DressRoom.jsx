import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Cookies from 'universal-cookie';
import ClothesLoading from '../../loading/ClothesLoading';

// import hark from 'hark';

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

import { AiFillPlusCircle } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';
import { BiChevronLeft } from 'react-icons/bi';
import { CgScreen } from 'react-icons/cg';
import { BsFillBookmarkStarFill } from 'react-icons/bs';

import { BsFillShareFill } from 'react-icons/bs';
import { RiMenuLine } from 'react-icons/ri';
import { MdFace } from 'react-icons/md';
import Menu from '../../NormalHeader/Menu';
import hark from 'hark';

const DressRoom = (props) => {
  const [canvas, setCanvas] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState('');
  const [initialWidth, setInitialWidth] = useState(0);
  const [userImg, setUserImg] = useState('');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false);
  const [unMountFlag, setunMountFlag] = useState(false);

  const canvasRef = useRef();
  const videoContainerRef = useRef();
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const userStream = useRef(); // 얘는 DOM을 지정하는 것 같지 않고 변수설정하는 것 같이 쓰는 모양(useRef는 변수관리 역할도 한다고 함)
  const senders = useRef([]);
  const roomID = useParams().roomID;
  const mouseChannel = useRef();
  const itemChannel = useRef();

  const navigate = useNavigate();

  const handleRecievedMouse = (data) => {
    data = JSON.parse(data);
    if (canvasRef.current?.offsetWidth - 25 > data.clientX) {
      modifyMouse(data);
    }
  };

  const lock = (object) => {
    object.hasControls = false;
    object.lockMovementX = true;
    object.lockMovementY = true;
    object.set('stroke', '#b33030');
    object.set('strokeWidth', 10);
  };

  const unlock = (object) => {
    object.hasControls = true;
    object.lockMovementX = false;
    object.lockMovementY = false;
    object.set('stroke', '');
    object.set('strokeWidth', 1);
  };

  function hangUp() {
    // Disconnect peer connection (WebRTC)
    try {
      peerRef.current.close();
      peerRef.current = null;
      mouseChannel.current = null;
      itemChannel.current = null;
    } catch (error) {}

    // Stop Video
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => {
        // Clearly indicates that the stream no longer uses the source
        track.stop();
      });
    }
    // Stop PeerVideo
    if (partnerVideo.current?.srcObject) {
      partnerVideo.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      partnerVideo.srcObject = null;
    }

    // Leave room and notify to the peer
    if (socketRef.current) {
      socketRef.current.emit('leave-room', roomID, () => {
        socketRef.current.disconnect();
      });
    }
  }

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
          if (object.id === data.id) {
            canvas.remove(object);
          }
        });
        break;
      case 'drawing':
        let path = new fabric.Path(data.path.path);
        path.set(data.path);
        path.selectable = data.selectable;
        path.setCoords();
        canvas.add(path);
        setTimeout(() => {
          canvas.remove(path);
        }, 3000);
        break;
      case 'selected':
        const activeID = canvas.getActiveObjects().map((object) => {
          return object.id;
        });

        if (activeID.includes(data.id)) {
          // 이미 내가 선택하고 있는 상품이면
          canvas.getActiveObjects().forEach((obj) => {
            if (obj.id === data.id) {
              if (data.obj.stroke === '#b33030') {
                obj.doubleSelected = true;
              } else {
                // conflict 상황 - 나는 골랐는데 상대는 아직 안고른 상황
                //obj select 풀기
                //일단 모든 select 풀기;
                obj.doubleSelected = false;
                unlock(obj);
                canvas.discardActiveObject().renderAll();
                // 자동으로 selection:cleared 이벤트 발생!
              }
              return;
            }
          });
          canvas.renderAll();
        } else {
          canvas.getObjects().forEach((object) => {
            if (object.id === data.id) {
              object.doubleSelected = false;
              lock(object);
              canvas.renderAll();
            }
          });
        }
        break;
      case 'deselected':
        canvas.getObjects().forEach((object) => {
          if (object.id === data.id) {
            object.doubleSelected = false;
            unlock(object);
            canvas.renderAll();
          }
        });
        break;
      default:
        break;
    }
  };

  const handleRecievedItem = (data) => {
    data = JSON.parse(data);
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

  const lastDeselectedEvent = (canvas) => {
    canvas.getActiveObjects().forEach((obj) => {
      try {
        itemChannel.current.send(
          JSON.stringify({
            obj: obj,
            id: obj.id,
            order: 'deselected',
          })
        );
      } catch (error) {
        // 상대 없을 때 send 시 에러
      }
    });
  };

  window.addEventListener('beforeunload', (event) => {
    if (canvas) {
      lastDeselectedEvent(canvas);
    }

    hangUp();

    setunMountFlag(false);
  });

  useEffect(async () => {
    getUserInfo();
    const canvasHeight = canvasRef.current?.offsetHeight - 1;
    const canvasWidth = canvasRef.current?.offsetWidth - 1;
    setInitialWidth(canvasWidth);

    // 개인 장바구니 상품을 가져온 후 로딩 종료
    setCanvas(initCanvas(canvasWidth, canvasHeight));

    setunMountFlag(true); // 이 UseEffect 끝까지는 false 유지.

    await navigator?.mediaDevices
      ?.getUserMedia({ audio: true, video: true }) // 사용자의 media data를 stream으로 받아옴(video, audio)
      ?.then((stream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = stream; // video player에 그 stream을 설정함
        }
        userStream.current = stream; // userStream이라는 변수에 stream을 담아놓음

        const options = {};
        const userSpeechEvents = hark(stream, options);
        userSpeechEvents.on('speaking', () => {
          setIsUserSpeaking(true);
        });

        userSpeechEvents.on('stopped_speaking', () => {
          setIsUserSpeaking(false);
        });
      })
      .catch(function (err) {
        console.log(err.name + ': ' + err.message);
      }); // always check for errors at the end.
    socketRef.current = io.connect('/');
    socketRef.current.emit('join room', roomID); // roomID를 join room을 통해 server로 전달함

    socketRef.current.on('exceedRoom', () => {
      alert('이미 꽉 찬 방입니다!');
      navigate('/mainpage');
    });

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
      if (otherUser.current === id) {
        deleteMouse(id);
        otherUser.current = '';
        try {
          partnerVideo.current.srcObject.getVideoTracks().forEach((track) => {
            track.stop();
          });
          partnerVideo.current.srcObject = null;
        } catch (error) {}
        peerRef.current.close();
      }
    });

    getPointer();
    setIsLoading(false);
    axios
      .get(`/privatebasket/${token}`)
      .then((Response) => {
        setProducts(Response.data.reverse());

        let shops = Response.data.reduce((acc, cv) => {
          acc = acc.concat(cv.shop_name);
          return acc;
        }, []);
      })
      .catch((Error) => {
        console.log(Error);
      })
      .then(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.on('selection:cleared', (opt) => {
        if (opt.deselected) {
          opt.deselected.forEach((obj) => {
            if (obj.doubleSelected) {
              obj.doubleSelected = false;
              lock(obj);
              canvas.renderAll();
            }
            try {
              itemChannel.current.send(
                JSON.stringify({
                  obj: obj,
                  id: obj.id,
                  order: 'deselected',
                })
              );
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          });
        }
      });
      canvas.on('selection:created', (opt) => {
        if (opt.selected.length >= 2 && opt.selected.filter((obj) => obj.stroke === '#b33030').length > 0) {
          canvas.discardActiveObject().renderAll();
          // 자동으로 selection:cleared 이벤트 발생!
        } else {
          opt.selected.forEach((obj) => {
            try {
              itemChannel.current.send(
                JSON.stringify({
                  obj: obj,
                  id: obj.id,
                  order: 'selected',
                })
              );
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          });
        }
      });
      canvas.on('selection:updated', (opt) => {
        const actives = canvas.getActiveObjects();
        if (actives.length >= 2 && actives.filter((obj) => obj.stroke === '#b33030').length > 0) {
          canvas.discardActiveObject().renderAll();
          // 자동으로 selection:cleared 이벤트 발생!
        } else {
          opt.selected.forEach((obj) => {
            try {
              itemChannel.current.send(
                JSON.stringify({
                  obj: obj,
                  id: obj.id,
                  order: 'selected',
                })
              );
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          });
        }

        if (opt.deselected) {
          opt.deselected.forEach((obj) => {
            if (obj.doubleSelected) {
              obj.doubleSelected = false;
              lock(obj);
              canvas.renderAll();
            }
            try {
              itemChannel.current.send(
                JSON.stringify({
                  obj: obj,
                  id: obj.id,
                  order: 'deselected',
                })
              );
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          });
        }
      });

      canvas.on('path:created', (options) => {
        options.path.selectable = false;
        const data = {
          order: 'drawing',
          path: options.path,
          selectable: false,
        };
        try {
          itemChannel.current.send(JSON.stringify(data));
        } catch (error) {
          // 상대 없을 때 send 시 에러
        }
        setTimeout(() => {
          canvas.remove(options.path);
        }, 3000);
      });
      canvas.on('object:modified', (options) => {
        if (options.target) {
          if (options.target._objects) {
            // 그룹으로 움직임
            options.target._objects.forEach((object) => {
              const matrix = object.calcTransformMatrix();
              const centerX = matrix[4];
              const centerY = matrix[5];
              const scale = object.scaleX;
              const left = centerX - (object.width * scale) / 2;
              const top = centerY - (object.height * scale) / 2;
              const modifiedObj = {
                obj: object,
                id: object.id,
                left: left,
                top: top,
                order: 'modify',
              };
              try {
                itemChannel.current.send(JSON.stringify(modifiedObj));
              } catch (error) {
                // 상대 없을 때 send 시 에러
              }
            });
          } else {
            // 낱개로 움직임
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
              left: options.target.left,
              top: options.target.top,
              order: 'modify',
            };
            try {
              itemChannel.current.send(JSON.stringify(modifiedObj));
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          }
        }
      });

      canvas.on('object:moving', (options) => {
        if (options.target) {
          if (options.target._objects) {
            // 그룹으로 움직임
            options.target._objects.forEach((object) => {
              const matrix = object.calcTransformMatrix();
              const centerX = matrix[4];
              const centerY = matrix[5];
              const scale = object.scaleX;
              const left = centerX - (object.width * scale) / 2;
              const top = centerY - (object.height * scale) / 2;
              const modifiedObj = {
                obj: object,
                id: object.id,
                left: left,
                top: top,
                order: 'modify',
              };
              try {
                itemChannel.current.send(JSON.stringify(modifiedObj));
              } catch (error) {
                // 상대 없을 때 send 시 에러
              }
            });
          } else {
            // 낱개로 움직임
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
              left: options.target.left,
              top: options.target.top,
              order: 'modify',
            };
            try {
              itemChannel.current.send(JSON.stringify(modifiedObj));
            } catch (error) {
              // 상대 없을 때 send 시 에러
            }
          }
        }
      });

      canvas.on('mouse:move', (options) => {
        const mouseobj = {
          clientX: options.e.offsetX,
          clientY: options.e.offsetY,
        };
        /*
        mouseChannel은 마우스 현재 위치 전송을 위한 webRTC 채널이다.
        다른 유저가 룸에 들어왔을때 초기화되므로 룸에 다른 유저가 없을때는
        send시 error가 발생한다. try catch문을 통해 이를 방지한다.
        */
        try {
          mouseobj.id = socketRef.current.id;
          mouseChannel.current.send(JSON.stringify(mouseobj));
        } catch (error) {
          // 상대 없을 때 send 시 에러
        }
      });
    }

    return () => {
      if (unMountFlag) {
        // 첫 시작시 unmount flag = false,
        setTimeout(() => {
          if (canvas) {
            lastDeselectedEvent(canvas);
          }
          hangUp();
        }, 2000);
      }
    };
  }, [canvas]);

  const HandleAddImgBtn = (e, item, canvi) => {
    e.preventDefault();
    let url;

    if (item.removedBgImg) {
      url = item.removedBgImg;
    } else {
      url = item.img;
    }

    new fabric.Image.fromURL(url, (img) => {
      img.set({
        id: uuid(),
        product_info: item,
        borderColor: 'orange',
        borderScaleFactor: 5,
        cornerColor: 'orange',
        cornerSize: 6,
        cornerStyle: 'rect',
        transparentCorners: false,
        isProfileImg: false,
      });
      img.scale(0.4);

      const sendObj = {
        obj: img,
        order: 'add',
        id: img.id,
        url: url,
        product_info: item,
        isProfileImg: false,
        left: 0,
        top: 0,
      };

      try {
        itemChannel.current.send(JSON.stringify(sendObj));
      } catch (error) {
        console.log(error);
      }

      canvi.add(img);
      canvi.renderAll();
    });
  };

  const HandleAddProfileImgBtn = (e, profileImg, canvi) => {
    e.preventDefault();

    const url = profileImg;
    if (url) {
      new fabric.Image.fromURL(url, (img) => {
        img.set({
          id: uuid(),
          borderColor: 'orange',
          borderScaleFactor: 5,
          cornerColor: 'orange',
          cornerSize: 6,
          cornerStyle: 'rect',
          transparentCorners: false,
          isProfileImg: true,
          product_info: '',
          profileUrl: url,
        });
        img.scale(0.1);
        const sendObj = {
          obj: img,
          order: 'add',
          id: img.id,
          url: url,
          isProfileImg: true,
          product_info: '',
          left: 0,
          top: 0,
        };

        try {
          itemChannel.current.send(JSON.stringify(sendObj));
        } catch (error) {
          console.log(error);
        }

        canvi.add(img);
        canvi.renderAll();
      });
    }
  };

  const HandleDeleteCanvasBtn = () => {
    canvas.getActiveObjects().forEach((obj) => {
      try {
        if (obj.stroke !== '#b33030') {
          // 락 걸린 상품이 아니면
          itemChannel.current.send(JSON.stringify({ obj: obj, id: obj.id, order: 'delete' }));
        }
      } catch (error) {
        // 상대 없을 때 send 시 에러
      }
      if (obj.stroke !== '#b33030') {
        canvas.remove(obj);
      }
    });
    canvas.discardActiveObject().renderAll();
    // 자동으로 selection:cleared 이벤트 발생!
  };

  const shareKakao = () => {
    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: '모바',
        description: '친구랑 코디하기',
        imageUrl: '#',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: '웹으로 이동',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  const copyLink = () => {
    let currentUrl = window.document.location.href; //복사 잘됨
    navigator.clipboard.writeText(currentUrl);
    toast.success('초대링크 복사 완료!', {
      position: 'bottom-center',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    shareKakao();
  };

  // ---------- webTRC video call ----------
  const callUser = (userID) => {
    peerRef.current = createPeer(userID);
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => senders.current.push(peerRef.current.addTrack(track, userStream.current))); //senders에 넣어준다 - 중요!
    }
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
            const actives = canvas.getActiveObjects();
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
                  const matrix = obj.calcTransformMatrix();
                  const centerX = matrix[4];
                  const centerY = matrix[5];
                  const scale = obj.scaleX;
                  const left = centerX - (obj.width * scale) / 2;
                  const top = centerY - (obj.height * scale) / 2;
                  const sendObj = {
                    obj: obj,
                    order: 'add',
                    id: obj.id,
                    url: url,
                    product_info: obj.product_info,
                    isProfileImg: false,
                    left: left,
                    top: top,
                  };
                  if (actives.includes(obj)) {
                    sendObj.selected = true;
                  }
                  if (obj.isProfileImg) {
                    sendObj.url = obj.profileUrl;
                    sendObj.isProfileImg = true;
                  }
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
    if (peerRef.current) {
      await peerRef.current
        .setRemoteDescription(desc)
        .then(() => {
          if (userStream.current) {
            userStream.current.getTracks().forEach((track) => senders.current.push(peerRef.current.addTrack(track, userStream.current)));
          }
        })
        .then(() => {
          return peerRef.current.createAnswer();
        })
        .then((answer) => {
          return peerRef.current.setLocalDescription(answer);
        })
        .then(() => {
          if (socketRef.current) {
            const payload = {
              target: incoming.caller,
              caller: socketRef.current.id,
              sdp: peerRef.current.localDescription,
            };
            socketRef.current.emit('answer', payload);
          }
        });
    }
  };

  const handleAnswer = (message) => {
    const desc = new RTCSessionDescription(message.sdp);
    if (peerRef.current) {
      peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
    }
  };

  const handleICECandidateEvent = (e) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      if (socketRef.current) {
        socketRef.current.emit('ice-candidate', payload);
      }
    }
  };

  const handleNewICECandidateMsg = (incoming) => {
    const candidate = new RTCIceCandidate(incoming);
    if (peerRef.current) {
      peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
    }
  };

  const handleTrackEvent = (e) => {
    if (partnerVideo.current) {
      partnerVideo.current.srcObject = e.streams[0];
      const options = {};
      const partnerSpeechEvents = hark(partnerVideo.current.srcObject, options);
      partnerSpeechEvents.on('speaking', () => {
        setIsPartnerSpeaking(true);
      });

      partnerSpeechEvents.on('stopped_speaking', () => {
        setIsPartnerSpeaking(false);
      });
    }
  };

  const HandleCameraBtnClick = () => {
    isCameraOn ? setIsCameraOn(false) : setIsCameraOn(true);

    if (userStream.current) {
      userStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const HandleMicBtnClick = () => {
    isMicOn ? setIsMicOn(false) : setIsMicOn(true);

    if (userStream.current) {
      userStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const HandleSoundBtnClick = () => {
    if (partnerVideo.current) {
      if (isSoundOn) {
        setIsSoundOn(false);
        partnerVideo.current.muted = true;
      } else {
        setIsSoundOn(true);
        partnerVideo.current.muted = false;
      }
    }
  };

  const HandleAddtoMyCartBtn = () => {
    canvas.getActiveObjects().forEach((obj) => {
      if (!obj.isProfileImg) {
        axios
          .post(`/privatebasket`, {
            token: token,
            products: [obj.product_info],
          })
          .then((Response) => {
            // Response가 정상일때 products에 상품을 추가한다.
            if (Response.status === 201) {
              setProducts([obj.product_info, ...products]);
              toast.success('장바구니에 성공적으로 들어갔습니다.', {
                position: 'top-center',
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            } else if (Response.status === 204) {
              toast.warn('게스트는 장바구니에 상품을 넣을 수 없습니다.', {
                position: 'top-center',
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          })
          .catch((Error) => {
            toast.warn('중복된 상품입니다.', {
              position: 'top-center',
              autoClose: 1500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          });
      }
    });
  };

  const HandleDeleteProductBtn = (shop_url) => {
    axios
      .delete(`/privatebasket/product`, { data: { token, shop_url } })
      .then(function (response) {
        setProducts(products?.filter((product) => product.shop_url !== shop_url));
      })
      .catch(function (error) {});
  };

  /// 콜렉션 추가 ///
  const CollectionItems = () => {
    let items = [];
    let dupCheck = [];
    let flag = true;
    if (canvas.getActiveObjects().length === 0) {
      flag = false;
      toast.warn('상품을 선택해주세요.', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    canvas.getActiveObjects().forEach((obj) => {
      if (dupCheck.includes(obj.product_info.category)) {
        toast.warn('중복된 카테고리의 상품은 추가할 수 없습니다.', {
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        flag = false;
        items = [];
        dupCheck = [];
        return;
      } else if (obj.product_info.category === '미지정' || obj.isProfileImg) {
        toast.warn('지원하지 않는 카테고리의 상품이 포함되어 있습니다.', {
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        flag = false;
        items = [];
        dupCheck = [];
        return;
      }
      items.push(obj.product_info);
      dupCheck.push(obj.product_info.category);
    });

    if ((flag && items.length < 3) || items > 3) {
      toast.warn('상의, 하의, 신발 하나 씩을 선택해주세요.', {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      flag = false;
    }

    if (flag && items.length === 3) {
      axios
        .post(`/collection/items`, {
          token: token,
          products: items,
        })
        .then((response) => {
          toast.success('컬렉션에 추가되었습니다.', {
            position: 'top-center',
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });
    }
  };
  /// 콜렉션 추가 ///

  window.addEventListener('resize', () => {
    setCanvas((canvas) => {
      try {
        canvas.setWidth(canvasRef.current?.offsetWidth);
        canvas.setHeight(canvasRef.current?.offsetHeight);
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
      setSmallWidth(canvasRef.current?.offsetWidth);
    }
    setIsActive(!isActive);

    if (isActive) {
      canvas.setWidth(document.body?.offsetWidth - videoContainerRef.current?.offsetWidth - 430);
    } else {
      // canvas.setWidth(initialWidth);
      canvas.setWidth(initialWidth);
    }
  };

  const DrawingFalse = () => {
    setIsDrawing(!isDrawing);
    canvas.isDrawingMode = false;
  };

  const HandleDrawing = () => {
    setIsDrawing(!isDrawing);
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

  function getUserInfo() {
    let token = getCookie('x_auth');
    axios.post('/api/users/info', { token }).then(function (response) {
      setUserId(response.data.username);
      setUserImg(response.data.profileImage);
    });
  }

  /* ------ */

  const [isDrawing, setIsDrawing] = useState(false);
  const [isMenuOpen, setIsMemuOpen] = useState(false);

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
              <div
                style={{
                  fontSize: '30px',
                  margin: '10px',
                  color: '#4c4c4c',
                }}
              >
                {userId} 님의 코디룸
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
              }}
            >
              <div onClick={copyLink} style={{ cursor: 'pointer' }}>
                <BsFillShareFill
                  size='32'
                  style={{
                    color: '#4c4c4c',
                    marginRight: '20px',
                  }}
                />
              </div>
              <div style={{ zIndex: '103' }} onClick={() => setIsMemuOpen(!isMenuOpen)}>
                {/* <RiMenuLine size='40' style={{ color: '#4c4c4c', cursor: 'pointer' }} /> */}
                {isMenuOpen ? <MdClose className={styles.closeBtn} size={40} /> : <RiMenuLine className={styles.menuBtn} size={40} />}
              </div>
            </div>
          </header>
          {/* <div style={{height:'3px', width: '100%', backgroundColor: 'black'}}></div> */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {isMenuOpen ? <Menu /> : <></>}
            <div className={isActive ? styles.shrink + ' ' + styles.body : styles.body}>
              <div ref={productSidebarRef} className={styles.ProductSidebar}>
                <div className={styles.sidebarLinks}>
                  <ul className={styles.productLists}>
                    {products.length > 0 ? (
                      products.map((item, index) => (
                        <div className={styles.tooltipElement} key={index}>
                          <div className={styles.productBox}>
                            <div style={{ backgroundColor: 'white' }}>
                              <img onClick={(e) => HandleAddImgBtn(e, item, canvas)} className={styles.newProductImg} src={item.img} alt='상품 이미지' />
                            </div>
                            <AiFillPlusCircle onClick={(e) => HandleAddImgBtn(e, item, canvas)} className={styles.addProductIcon} color='orange' size='50' />
                            <div className={styles.hide + ' ' + styles.info}>
                              <MdClose onClick={(e) => HandleDeleteProductBtn(item.shop_url)} size={20} className={styles.removeProductIcon} />
                              <div>
                                <span className={styles.shopName}>{item.shop_name}</span>
                                <div className={styles.productName}>
                                  <a className={styles.shopLink} href={item.shop_url} target='_blank'>
                                    {item.product_name}
                                  </a>
                                </div>
                              </div>
                              <div className={styles.price}>{item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyBascket}>
                        <img className={styles.emptyImg} src='/images/privateBasket2.png' alt='빈장바구니'></img>
                        <div className={styles.emptyInfo}>장바구니에 </div>
                        <div className={styles.emptyInfo}>상품이 없어요</div>
                      </div>
                    )}
                  </ul>
                </div>
              </div>

              <div ref={canvasRef} className={styles.canvasContainer}>
                <div className={styles.sidebarTop}>
                  <div ref={shrinkBtnRef} onClick={handleShrinkBtn}>
                    <BiChevronLeft className={styles.chevronIcon} size='50' />
                    {isActive ? <span className={styles.openTooltip}>펼쳐보기</span> : <span className={styles.closeTooltip}>접기</span>}
                  </div>
                </div>
                <div className={styles.toolbar}>
                  <button className={styles.toolbarBtn} onClick={HandleDeleteCanvasBtn}>
                    <span className={styles.removeTooltip}>지우기</span>
                    <BsTrash size='30' />
                  </button>
                  <button className={styles.toolbarBtn} onClick={HandleAddtoMyCartBtn}>
                    <span className={styles.addCartTooltip}>장바구니 저장</span>
                    <MdAddShoppingCart size='30' />
                  </button>

                  {isDrawing ? (
                    <button className={styles.toolbarBtn} onClick={DrawingFalse}>
                      <span className={styles.DrawingFalseTooltip}>그리기 모드 해제</span>
                      <BsHandIndexThumb size='30' />
                    </button>
                  ) : (
                    <button className={styles.toolbarBtn} onClick={HandleDrawing}>
                      <span className={styles.DrawingTrueTooltip}>그리기 모드</span>
                      <BsPencilFill size='30' />
                    </button>
                  )}

                  {/* 컬렉션 기능 추가 */}
                  <button className={styles.toolbarBtn} onClick={CollectionItems}>
                    {/* <BsFillCollectionFill size='30' /> */}
                    {/* <BsBookmarkStarFill size='30' /> */}
                    <span className={styles.collectionTooltip}>내 컬렉션 저장</span>
                    <BsFillBookmarkStarFill size='30' />

                    {/* <RiBookmark3Fill size='30' /> */}
                    {/* <GiSaveArrow size='30' /> */}
                    {/* <BsSave2Fill size='30' /> */}
                  </button>
                  <button className={styles.toolbarBtn} onClick={(e) => HandleAddProfileImgBtn(e, userImg, canvas)}>
                    <span className={styles.addFaceTooltip}>프로필 이미지 추가</span>
                    <MdFace size='30' />
                  </button>
                  {/* 컬렉션 기능 추가 */}
                </div>
                <ToastContainer
                  position='bottom-center'
                  autoClose={1500}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <div id='pointers' className={styles.pointers}></div>
                <canvas className={styles.canvas} id='canvas'></canvas>
              </div>
            </div>
          </div>

          <div ref={videoContainerRef} className={styles.sidebarB}>
            <div className={styles.video_container}>
              <div className={isUserSpeaking ? styles.user1 + ' ' + styles.userSpeaking : styles.user1}>
                <video id='UserMuteCtrl' autoPlay ref={userVideo} className={styles.video} muted='muted' poster='/images/user1.png'>
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
              <div className={isPartnerSpeaking ? styles.user1 + ' ' + styles.partnerSpeaking : styles.user1}>
                <video id='partnerMuteCtrl' autoPlay ref={partnerVideo} className={styles.video} poster='/images/user1.png'>
                  video 2
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DressRoom;
