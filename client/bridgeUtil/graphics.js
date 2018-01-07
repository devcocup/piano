import degreesToRadians from '../util/degreesToRadians';
import drawEllipse from '../util/drawEllipse';

(function(bridgeUtil) {
  const contexts = {};

  const getFillStyle = brush => 
    'rgba(' + brush.Color.Red + ',' + brush.Color.Green + ',' + 
      brush.Color.Blue + ',' + (brush.Color.Alpha/255) + ')';

  const getContext = name => {
    if (!contexts[name]) {
      const c = document.querySelector(".canvas-" + name);
      contexts[name] = c.getContext('2d');
    }
    return contexts[name];
  };

  bridgeUtil.graphics = {
    translateTransform: function(gfx, x, y) {
      gfx.context.translate(x,y);
    },
    drawImage: function(gfx, image, x, y, width, height) {
      gfx.context.drawImage(image.domImage,x,y,width,height);
    },
    drawString: function(gfx, text, font, brush, x, y) {
      gfx.context.fillStyle = getFillStyle(brush);
      gfx.context.fillText(text, x, y);
    },
    drawLine: function(gfx, pen, xStart, yStart, xEnd, yEnd) {
      gfx.context.strokeStyle = getFillStyle(pen);
      gfx.context.beginPath();
      gfx.context.lineWidth = pen.width;
      gfx.context.moveTo(xStart, yStart);
      gfx.context.lineTo(xEnd, yEnd);
      gfx.context.stroke();
    },
    drawBezier: function(gfx, pen, x1, y1, x2, y2, x3, y3, x4, y4) {
      gfx.context.strokeStyle = getFillStyle(pen);
      gfx.context.beginPath();
      gfx.context.lineWidth = pen.width;
      gfx.context.moveTo(x1, y1);
      gfx.context.bezierCurveTo(x2, y2, x3, y3, x4, y4);
      gfx.context.stroke();
    },
    scaleTransform: function(gfx, x, y) {
      gfx.context.scale(x,y);
    },
    fillRectangle: function(gfx, brush, x, y, width, height) {
      gfx.context.fillStyle = getFillStyle(brush);
      gfx.context.fillRect(x,y,width,height);
    },
    clearRectangle: function(gfx, x, y, width, height) {
      gfx.context.clearRect(x,y,width,height);
    },
    rotateTransform: function(gfx, angleDeg) {
      gfx.context.rotate(degreesToRadians(angleDeg));
    },
    fillEllipse: function(gfx, brush, x, y, width, height) {
      gfx.context.fillStyle = getFillStyle(brush);
      drawEllipse(gfx.context, x, y ,width, height, true);
    },
    drawEllipse: function(gfx, pen, x, y, width, height) {
      gfx.context.strokeStyle = getFillStyle(pen);
      gfx.context.lineWidth = pen.width;
      drawEllipse(gfx.context, x, y ,width, height, false);
    },
    initGraphics: function(gfx) {
      gfx.context = getContext(gfx.Name);
    }
  };
  
})(window.bridgeUtil || (window.bridgeUtil = {}));
