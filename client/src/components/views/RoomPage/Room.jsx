import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import Header from "../../header/Header";
import styles from "./Room.module.css";
import { useHistory, useParams, useNavigate } from "react-router-dom";
import AddProduct from "../../addUrl/AddProduct";
import WishList from "../../wishlist/Wishlist";
import RoomMemu from "../../memu/RoomMemu";
import axios from "axios";
import InviteBtn from "../../inviteBtn/InviteBtn";

// 이 props에는 어떤 정보가 들어가지? 찍어보니까 history, location, url, path등의 정보를 받음

const Room = props => {
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  // 얘는 DOM을 지정하는 것 같지 않고 변수설정하는 것 같이 쓰는 모양(useRef는 변수관리 역할도 한다고 함)
  const userStream = useRef();
  const senders = useRef([]);
  const roomID = useParams().roomID;

  window.onload = function () {
    axios.get(`/room/${roomID}`).then(response => {
      if (response.data.success) {
        return (document.location.href = "/");
      }
    });
  };

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true }) // 사용자의 media data를 stream으로 받아옴(video, audio)
      .then(stream => {
        userVideo.current.srcObject = stream; // video player에 그 stream을 설정함
        userStream.current = stream; // userStream이라는 변수에 stream을 담아놓음
        socketRef.current = io.connect("/");
        socketRef.current.emit("join room", roomID); // roomID를 join room을 통해 server로 전달함
        socketRef.current.on("other user", userID => {
          callUser(userID);
          otherUser.current = userID;
        });
        socketRef.current.on("user joined", userID => {
          otherUser.current = userID;
        });
        socketRef.current.on("offer", handleRecieveCall);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
      });
  }, []); // 맨 처음 한번만

  function callUser(userID) {
    peerRef.current = createPeer(userID);
    //senders에 넣어준다 - 중요!
    userStream.current.getTracks().forEach(track => senders.current.push(peerRef.current.addTrack(track, userStream.current)));
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
      .then(offer => {
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
      .catch(e => console.log(e));
  }

  function handleRecieveCall(incoming) {
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current.getTracks().forEach(track => senders.current.push(peerRef.current.addTrack(track, userStream.current)));
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then(answer => {
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
    peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
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

    peerRef.current.addIceCandidate(candidate).catch(e => console.log(e));
  }

  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
  }

  function shareScreen() {
    window.resizeTo((window.screen.availWidth / 7) * 3, window.screen.availHeight);

    navigator.mediaDevices
      .getDisplayMedia({ cursor: true })
      .then(stream => {
        window.resizeTo(window.screen.availWidth * 0.15, window.screen.availHeight);

        const screenTrack = stream.getTracks()[0];
        //face를 screen으로 바꿔줌
        senders.current.find(sender => sender.track.kind === "video").replaceTrack(screenTrack);
        //크롬에서 사용자가 공유중지를 누르면, screen을 face로 다시 바꿔줌
        screenTrack.onended = function () {
          senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
        };
      })
      .catch(() => {
        window.resizeTo(window.screen.availWidth * 0.15, window.screen.availHeight);
      });
  }

  return (
    <>
      <Header />
      <section className={styles.frame}>
        <div className={styles.webcam__box}>
          <div className={styles.videoContainer}>
            <video className={styles.video__control} autoPlay ref={userVideo} />
            <video controls className={styles.video__control} autoPlay ref={partnerVideo} />
            <RoomMemu onShareScreen={shareScreen} />
          </div>
          <InviteBtn />
        </div>
      </section>
    </>
  );
};

export default Room;
