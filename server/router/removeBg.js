const ORIGINAL_IMAGE_ID = 'original-img',
  CANVAS_ID = 'canvas',
  FORM_ID = 'image-form',
  DOWNLOAD_BUTTON_ID = 'download-button',
  IMAGE_INPUT_ID = 'image-input',
  IMAGE_LABEL_ID = 'image-label';
window.onload = () => {
  Listeners.inputFileChange('image-input', 'image-label'),
    Listeners.formSubmit(FORM_ID),
    Listeners.downloadButton('download-button', 'original-img', 'canvas');
};
const Listeners = {
    formSubmit: (formId) => {
      document
        .getElementById(formId)
        .addEventListener('submit', (formEvent) => {
          formEvent.preventDefault(),
            ImageProcessor.getImageDataFromInputFile(
              '#image-form input[type=file]'
            )
              .then((imageData) => ImageProcessor.getImageObject(imageData))
              .then(
                (imageObject) =>
                  ImageProcessor.createPreviewAndCanvas(
                    imageObject,
                    'original-img',
                    'canvas',
                    ImageProcessor.drawImageOnCanvas
                  ),
                console.log(
                  document.querySelector('#image-input').width,
                  'dkfjlakjkldsa'
                )
              );
        });
    },
    downloadButton: (downloadButtonId, originalImageId, canvasId) => {
      const downloadButtonElement = document.getElementById(downloadButtonId),
        canvasElement = document.getElementById(canvasId);
      downloadButtonElement.addEventListener('click', (event) => {
        document.getElementById(originalImageId) || event.preventDefault();
        const imageToDownload = canvasElement
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        downloadButtonElement.setAttribute('href', imageToDownload);
      });
    },
    inputFileChange: (imageInputId, imageLabelId) => {
      document
        .getElementById(imageInputId)
        .addEventListener('change', (event) => {
          document.getElementById(imageLabelId).innerText =
            event.target.files[0].name;
        });
    },
  },
  ImageProcessor = {
    getImageDataFromInputFile: (query) => {
      // 파일을맨처음 읽어오는 곳
      fs.readFile('./tesnukki/test.jpg', 'utf-8', function (err, data) {
        console.log(data, 'data');
      });
      const imageData = document.querySelector(query).files[0];
      return new Promise((resolve) => resolve(imageData));
    },
    getImageObject: (imageData) => {
      const fileReader = new FileReader(),
        imageObject = new Image();
      return (
        fileReader.readAsDataURL(imageData),
        (fileReader.onload = (event) => {
          imageObject.src = event.target.result;
        }),
        new Promise((resolve) => resolve(imageObject))
      );
    },
    createPreviewAndCanvas: (
      imageObject,
      imageId,
      canvasId,
      canvasCallback
    ) => {
      const imageElement = document.createElement('img');
      return (
        (imageObject.onload = () => {
          const oldImage = document.getElementById(imageId);
          console.log(
            oldImage,
            'imageElement by getElementById(imageId) is here'
          );
          console.log('e.width', imageObject.width);
          console.log('e.width', imageObject.height);
          oldImage && oldImage.remove(),
            (imageElement.src = imageObject.src),
            (imageElement.width = imageObject.width),
            (imageElement.height = imageObject.height),
            (imageElement.id = imageId),
            (imageElement.className = 'hidden'),
            document
              .querySelector('.preview-original-image')
              .appendChild(imageElement),
            canvasCallback(canvasId, imageId);
        }),
        new Promise((resolve) => resolve())
      );
    },
    drawImageOnCanvas: (canvasElementId, originalImageElementId) => {
      const canvas = document.getElementById(canvasElementId),
        imageElement = document.getElementById(originalImageElementId),
        canvasContext = canvas.getContext('2d');
      console.log(imageElement, 'imgaeElement in drawImageOnCanvas');

      (canvas.height = imageElement.height),
        (canvas.width = imageElement.width),
        canvasContext.drawImage(imageElement, 0, 0);
      const imageData = canvasContext.getImageData(
          0,
          0,
          imageElement.width,
          imageElement.height
        ),
        pixels = imageData.data,
        r = 0,
        g = 0,
        d = 0,
        s = 0;
      for (let e = 0, t = pixels.length; e < t; e += 4) {
        let t = pixels[e],
          n = pixels[e + 1],
          a = pixels[e + 2];
        255 === t &&
          255 === n &&
          255 === a &&
          ((pixels[e] = r),
          (pixels[e + 1] = g),
          (pixels[e + 2] = d),
          (pixels[e + 3] = s));
      }
      canvasContext.putImageData(imageData, 0, 0);
      console.log(canvas.toDataURL(), 'here');
    },
  };
