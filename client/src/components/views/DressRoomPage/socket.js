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
// emitters
export const emitAdd = (obj, socket) => {
  socket.emit("object-added", obj);
};

export const emitModify = (obj, socket) => {
  socket.emit("object-modified", obj);
};

// listeners
export const addObj = (canvas, socket) => {
  socket.off("new-add");
  socket.on("new-add", data => {
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
      new fabric.Image.fromURL(url, img => {
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
  socket.on("new-modification", data => {
    const { obj, id } = data;
    canvas.getObjects().forEach(object => {
      if (object.id === id) {
        object.set(obj);
        object.setCoords();
        canvas.renderAll();
      }
    });
  });
};

export const modifyMouse = (canvas, data) => {
  if (!clients.hasOwnProperty(data.id)) {
    pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
  }

  canvas = document.getElementById("canvas");
  console.log("hi", canvas);
  pointers[data.id].style.left = data.clientX + "px";
  pointers[data.id].style.top = data.clientY + "px";
  pointers[data.id].style.position = "absolute";
  pointers[data.id].style.width = "30px";
  pointers[data.id].style.height = "45px";
  pointers[data.id].src = "/images/pointer.png";

  pointers[data.id].style.zIndex = 20;
  clients[data.id] = data;
  clients[data.id].updated = now();
};

export const getPointer = () => {
  prev = {};
  canvas = document.getElementById("canvas");
  pointerContainer = document.getElementById("pointers");
  pointer = document.createElement("img");
  pointer.setAttribute("class", "pointer");
  lastEmit = now();
};

export const deleteMouse = async id => {
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
