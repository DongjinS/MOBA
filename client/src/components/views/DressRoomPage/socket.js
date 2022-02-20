import io from "socket.io-client";
import { fabric } from "fabric";

let prev;
let canvas;
let pointerContainer;
let pointer;
let lastEmit;
let clients = {};
let pointers = {};

function now() {
  return new Date().getTime();
}

export const socketConnect = () => {
  const socket = io.connect("/");
  return socket;
};

// emitters
export const emitAdd = (obj, socket) => {
  socket.emit("object-added", obj);
};

export const emitModify = (obj, socket) => {
  socket.emit("object-modified", obj);
};

export const emitMouse = (obj, socket) => {
  if (now() - lastEmit > 5) {
    // console.log("send", obj.clientX, obj.clientY);
    socket.emit("mousemove", {
      x: obj.clientX,
      y: obj.clientY,
    });
  }
  lastEmit = now();
};

// listeners
export const addObj = (canvas, socket) => {
  socket.off("new-add");
  socket.on("new-add", (data) => {
    const { obj, id, url } = data;
    let object;

    console.log(obj.type);

    if (obj.type === "rect") {
      object = new fabric.Rect({
        height: obj.height,
        width: obj.width,
      });
      object.set({ id: id });
      canvas.add(object);
      canvas.renderAll();
    } else if (obj.type === "image") {
      new fabric.Image.fromURL(url, (img) => {
        console.log("receive", img._element.currentSrc);
        img.set({ id: id });
        img.scale(0.75);
        canvas.add(img);
        canvas.renderAll();
      });
    }
  });
};

export const modifyObj = (canvas, socket) => {
  socket.on("new-modification", (data) => {
    const { obj, id } = data;
    canvas.getObjects().forEach((object) => {
      if (object.id === id) {
        object.set(obj);
        object.setCoords();
        canvas.renderAll();
      }
    });
  });
};

export const modifyMouse = (canvas, socket) => {
  socket.on("moving", function (data) {
    // console.log("hello");
    // console.log(data);
    // console.log(pointerContainer);
    if (!clients.hasOwnProperty(data.id)) {
      pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
    }

    pointers[data.id].style.left = data.x + "px";
    pointers[data.id].style.top = data.y + "px";
    pointers[data.id].style.position = "absolute";
    pointers[data.id].style.width = "15px";
    pointers[data.id].style.height = "22px";
    pointers[data.id].src = "https://uploads.codesandbox.io/uploads/user/88acfe5a-77fc-498c-98ee-d1b0b303f6a8/tC4n-pointer.png";

    pointers[data.id].style.zIndex = 10;

    // console.log(document);

    // console.log(pointers[data.id]);

    clients[data.id] = data;
    clients[data.id].updated = now();
  });
};

export const getPointer = () => {
  // const url = window.location.origin;
  prev = {};
  // console.log(document);
  canvas = document.getElementById("canvas");
  // console.log("canvas", canvas);
  pointerContainer = document.getElementById("pointers");
  // console.log(pointerContainer);
  pointer = document.createElement("img");
  pointer.setAttribute("class", "pointer");

  lastEmit = now();
};

export const deleteMouse = async (id) => {
  console.log("disconnected", pointers[id]);
  delete clients[id];
  if (pointers[id]) {
    try {
      pointers[id].parentNode.removeChild(pointers[id]);
      return;    
    } catch (error) {
      return;
    }
  }
};
