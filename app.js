var canvas = document.getElementById('dali')
, context = canvas.getContext('2d')
, img = document.createElement('img')
, ratios = {
  canvas: 1,
  img: 1
}
, imgResize = {
  width: 0,
  height: 0
}
, imgOffset = {
  top: 0,
  left: 0
}
, ariaSize = 400
, target = {x: 0, y: 0}
, drawSource = {
  x: null,
  y: null,
  xw: 0,
  yw: 0
}
, pixelSize = 40
;

resizeCanvas();


img.onload = function (data) {
  draw();
  initEvents();
};

img.src = "/image.jpg";

window.onresize = function () {
  resizeCanvas();
  draw();
};

function initEvents () {
  canvas.addEventListener('mousemove', function (event) {
    computePixelsAt(event.offsetX, event.offsetY);
  });

  computePixelsAt(400, 300);

}

function draw() {
  computeInitImageState();
  drawInitImageState();
}

function computePixelsAt (x, y) {
  target.x = x - ariaSize / 2;
  target.y = y - ariaSize / 2;

  /* x coordinate */
  drawSource.x = target.x - imgOffset.left;

  if (target.x < imgOffset.left) {
    if (imgOffset.left - target.x < ariaSize) {
      drawSource.x = 0;
    } else {
      drawSource.x = null;
    }
  }

  if (drawSource.x > imgResize.width) {
    drawSource.x = null;
  }

  /* y coordinate */
  drawSource.y = target.y - imgOffset.top;

  if (target.y < imgOffset.top) {
    if (imgOffset.top - target.y < ariaSize) {
      drawSource.y = 0;
    } else {
      // console.log('y out of bounds')
      drawSource.y = null;
    }
  }
  if (drawSource.y > imgResize.height) {
    // console.log('y out of bounds')
    drawSource.y = null;
  }

  if (drawSource.x != null) {
    drawSource.xw = (target.x + ariaSize) - imgOffset.left;

    if (drawSource.xw == 0) {
      drawSource.xw = 1;
    }

    if (drawSource.xw > ariaSize) {
      drawSource.xw = ariaSize;

      if (drawSource.x + drawSource.xw > imgResize.width) {
        drawSource.xw = imgResize.width - drawSource.x;
      }
    }
  }

  if (drawSource.y != null) {
    drawSource.yw = (target.y + ariaSize) - imgOffset.top;

    if (drawSource.yw == 0) {
      drawSource.yw = 1;
    }

    if (drawSource.yw > ariaSize) {
      drawSource.yw = ariaSize;

      if (drawSource.y + drawSource.yw > imgResize.height) {
        drawSource.yw = imgResize.height - drawSource.y;
      }
    }
  }

  var canvasImage = document.createElement('canvas')
  , contextImage  = canvasImage.getContext('2d')
  , imageDataProc
  ;

  drawInitImageState();

  canvasImage.width = imgResize.width;
  canvasImage.height = imgResize.height;

  contextImage.drawImage(img, 0, 0, img.width, img.height, 0, 0, imgResize.width, imgResize.height);

  if (drawSource.x != null && drawSource.y != null) {
    var maxColumns = Math.ceil(drawSource.xw / pixelSize);
    var maxRows = Math.ceil(drawSource.yw / pixelSize);
    var cellWidth, cellHeight;

    for (var row = 0; row < maxRows; row++) {
      cellWidth = pixelSize;
      if (row == maxRows - 1) {
        cellWidth = drawSource.xw - (maxRows - 1) * pixelSize;
      }

      for (var column = 0; column < maxColumns; column++) {
        cellHeight = pixelSize;

        if (column == maxColumns - 1) {
          cellHeight = drawSource.yw - (maxColumns - 1) * pixelSize;
        }

        imageDataProc = contextImage.getImageData(drawSource.x + column * cellWidth, drawSource.y + row * cellHeight, cellWidth, cellHeight);

        var pixelAvg = {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };

        for (var i = 0; i < imageDataProc.data.length; i += 4) {
          pixelAvg.r += imageDataProc.data[i];
          pixelAvg.g += imageDataProc.data[i + 1];
          pixelAvg.b += imageDataProc.data[i + 2];
          pixelAvg.a += imageDataProc.data[i + 3];
        }

        pixelAvg.r = pixelAvg.r / (imageDataProc.data.length / 4);
        pixelAvg.g = pixelAvg.g / (imageDataProc.data.length / 4);
        pixelAvg.b = pixelAvg.b / (imageDataProc.data.length / 4);
        pixelAvg.a = pixelAvg.a / (imageDataProc.data.length / 4);

        for (var i = 0; i < imageDataProc.data.length; i += 4) {
          imageDataProc.data[i] = pixelAvg.r;
          imageDataProc.data[i + 1] = pixelAvg.g;
          imageDataProc.data[i + 2] = pixelAvg.b;
          imageDataProc.data[i + 3] = pixelAvg.a;
        }

        context.putImageData(imageDataProc, imgOffset.left + drawSource.x + column * cellWidth, imgOffset.top + drawSource.y + row * cellHeight);
      }
    }
  }
}

function computeInitImageState () {
  ratios.canvas = canvas.width / canvas.height;
  ratios.img = img.width / img.height;

  // center image on screen;
  if (ratios.canvas > ratios.img) {
    imgResize.width  = canvas.height * ratios.img;
    imgResize.height = canvas.height;
    imgOffset.left   = (canvas.width - imgResize.width) / 2;
  } else {
    imgResize.width  = canvas.width;
    imgResize.height = canvas.width / ratios.img;
    imgOffset.top    = (canvas.height - imgResize.height) / 2;
  }
}

function drawInitImageState () {
  context.fillStyle = "#303956";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // draw image
  context.drawImage(img, 0, 0, img.width, img.height, imgOffset.left, imgOffset.top, imgResize.width, imgResize.height);
}

function resizeCanvas () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}