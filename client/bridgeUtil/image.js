import * as images from './images';

(function(bridgeUtil) {
  const resourceImages = {};
  let preloadPromise;

  bridgeUtil.image = {
    preloadImages: () =>
      preloadPromise ||
      (preloadPromise = new Promise(resolve => {
        let imagesLoadedCount = 0;
        Object.entries(images).forEach(kvp => {
          const [name, src] = kvp;
          const img = document.createElement('img');
          img.src = src;
          resourceImages[name] = img;
          img.onload = () => {
            imagesLoadedCount++;
            if (imagesLoadedCount === Object.entries(images).length) {
              resolve();
            }
          };
        });
      })),
    ctor: (image, type, fileName) => {
      const key = /^Resources\.Images\..*\.png$/.test(fileName)
        ? fileName.split('.')[2]
        : fileName;
      const img = resourceImages[key];
      image.width = img.width;
      image.height = img.height;
      image.domImage = img;
    },
    getWidth: image => {
      return image.width;
    },
    getHeight: image => {
      return image.height;
    },
  };
})(window.bridgeUtil || (window.bridgeUtil = {}));
