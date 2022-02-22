import { fabric } from "fabric";

let canvas;
let pointerContainer;
let pointer;
let clients = {};
let pointers = {};

// listeners
export const addImg = (canvas, data) => {
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
};

export const modifyObj = (canvas, data) => {
  const { obj, id } = data;
  canvas.getObjects().forEach(object => {
    if (object.id === id) {
      object.set(obj);
      object.setCoords();
      canvas.renderAll();
    }
  });
};

export const modifyMouse = data => {
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
  pointers[data.id].src = "/images/orange_pointer.png";

  pointers[data.id].style.zIndex = 20;
  clients[data.id] = data;
};

export const getPointer = () => {
  canvas = document.getElementById("canvas");
  pointerContainer = document.getElementById("pointers");
  pointer = document.createElement("img");
  pointer.setAttribute("class", "pointer");
};

export const deleteMouse = async id => {
  console.log("disconnect", pointers[id]);
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
