var context = document.getElementById("imageCanvas").getContext("2d");
var cropContext = document.getElementById("cropCanvas").getContext("2d");
var container = document.getElementById("canvasContainer");

var btnUndo = document.getElementById("btnUndo");
var btnRedo = document.getElementById("btnRedo");

var pastSources = [];
var futureSources = [];
var baseImage;

var tempContext = document.createElement("canvas").getContext("2d");

setupImage();

function loadImage() {
	var filePicker = document.getElementById("filePicker");
	var file = filePicker.files[0];
	if (file !== undefined && file !== null) {

		var reader = new FileReader();
		reader.onload = function (e) {
			changeImageSrc(baseImage, e.target.result);
		};
		reader.readAsDataURL(file);
	}
}

function drawImage(context, canvas, image) {

	context.save();
	context.translate(canvas.width / 2, canvas.height / 2);
	context.drawImage(image, -image.width / 2, -image.height / 2);
	context.restore();

}

function changeImageSrc(image, src) {

	clearCrop();

	futureSources = [];
	if(image.src !== undefined && image.src !== null && image.src !== ""){
		pastSources.push(image.src);
	}
	image.src = src;

	if (pastSources.length > 0) {
		btnUndo.disabled = false;
	}

	btnRedo.disabled = true;

}

function setContainerSize(cont, width, height) {

	var pxWidth = "" + width + "px";
	var pxHeight = "" + height + "px";

	cont.setAttribute("style", "width:" + pxWidth + ";height:" + pxHeight);
	cont.style.width = pxWidth;
	cont.style.height = pxHeight;

}

function setupImage() {

	var startup = function () {

		context.canvas.width = baseImage.width;
		context.canvas.height = baseImage.height;

		setContainerSize(container, baseImage.width, baseImage.height);

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		drawImage(context, context.canvas, baseImage);

	};

	baseImage = new Image();
	baseImage.addEventListener("load", startup, false);

}

function undo() {

	if (pastSources.length <= 0) {
		return;
	}

	futureSources.push(baseImage.src);
	baseImage.src = pastSources.pop();

	if (pastSources.length <= 0) {
		btnUndo.disabled = true;
	}

	if (futureSources.length > 0) {
		btnRedo.disabled = false;
	}

}

function redo() {

	if (futureSources.length <= 0) {
		return;
	}

	pastSources.push(baseImage.src);
	baseImage.src = futureSources.pop();

	if (futureSources.length <= 0) {
		btnRedo.disabled = true;
	}

	if (pastSources.length > 0) {
		btnUndo.disabled = false;
	}

}

function getCanvasLocation(canvas, event) {

	var rect = canvas.getBoundingClientRect();
	var x = event.clientX - rect.left;
	var y = event.clientY - rect.top;

	return { x: x, y: y };

}

function createRectange(start, end) {

	var x = end.x;
	if (end.x > start.x) {
		x = start.x;
	}

	var y = end.y;
	if (end.y > start.y) {
		y = start.y;
	}

	var width = Math.abs(end.x - start.x);
	var height = Math.abs(end.y - start.y);

	return { x: x, y: y, width: width, height: height };

}

function activateCrop() {

	var startPoint = {};
	var endPoint = {};

	cropContext.canvas.width = context.canvas.width;
	cropContext.canvas.height = context.canvas.height;

	var mousedownStart = function (e) {

		startPoint = getCanvasLocation(cropContext.canvas, e);

		cropContext.canvas.removeEventListener("mousedown", mousedownStart);
		cropContext.canvas.addEventListener("mousedown", mousedownEnd);
		cropContext.canvas.addEventListener("mousemove", mousemove);

	};

	var mousemove = function (e) {

		var end = getCanvasLocation(cropContext.canvas, e);
		var rect = createRectange(startPoint, end);

		cropContext.clearRect(0, 0, cropContext.canvas.width, cropContext.canvas.height);

		cropContext.fillStyle = "rgba(100, 100, 100, 0.5)";
		cropContext.fillRect(0, 0, cropContext.canvas.width, cropContext.canvas.height);
		cropContext.globalCompositeOperation = "destination-out";
		cropContext.fillRect(rect.x, rect.y, rect.width, rect.height);
		cropContext.globalCompositeOperation = "source-over";

	};

	var mousedownEnd = function (e) {

		endPoint = getCanvasLocation(cropContext.canvas, e);

		setCrop(createRectange(startPoint, endPoint));

		cropContext.canvas.removeEventListener("mousemove", mousemove);
		cropContext.canvas.removeEventListener("mousedown", mousedownEnd);

	};

	cropContext.canvas.addEventListener("mousedown", mousedownStart);

}

function clearCrop() {

	setCrop({
		x: undefined,
		y: undefined,
		width: undefined,
		height: undefined
	});

	cropContext.clearRect(0, 0, cropContext.canvas.width, cropContext.canvas.height);

}

function rotateImage(degrees) {

	var rads = degrees * (Math.PI / 180);
	var sin = Math.abs(Math.sin(rads));
	var cos = Math.abs(Math.cos(rads));

	var wa = baseImage.width * cos;
	var wb = baseImage.height * sin;
	var width = Math.round(wa + wb);

	var ha = baseImage.width * sin;
	var hb = baseImage.height * cos;
	var height = Math.round(ha + hb);

	tempContext.canvas.width = Math.max(tempContext.canvas.width, width);
	tempContext.canvas.height = Math.max(tempContext.canvas.height, height);

	tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
	tempContext.save();
	tempContext.translate(tempContext.canvas.width / 2, tempContext.canvas.height / 2);
	tempContext.rotate(rads);
	tempContext.drawImage(baseImage, -baseImage.width / 2, -baseImage.height / 2);
	var imageData = tempContext.getImageData(
		(tempContext.canvas.width / 2) - width / 2,
		(tempContext.canvas.height / 2) - height / 2,
		width, height);
	tempContext.restore();

	tempContext.canvas.width = width;
	tempContext.canvas.height = height;
	tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
	tempContext.putImageData(imageData, 0, 0);

	var data = tempContext.canvas.toDataURL();
	changeImageSrc(baseImage, data);

}

function setCrop(rect) {

	var x = document.getElementById("cropX");
	var y = document.getElementById("cropY");
	var width = document.getElementById("cropWidth");
	var height = document.getElementById("cropHeight");

	x.value = rect.x;
	y.value = rect.y;
	width.value = rect.width;
	height.value = rect.height;

}

function cropImage() {

	var x = parseInt(document.getElementById("cropX").value, 10);
	var y = parseInt(document.getElementById("cropY").value, 10);
	var width = parseInt(document.getElementById("cropWidth").value, 10);
	var height = parseInt(document.getElementById("cropHeight").value, 10);

	if (isNaN(x)) {
		x = 0;
	}

	if (isNaN(y)) {
		y = 0;
	}

	if (isNaN(width)) {
		width = 0;
	}

	if (isNaN(height)) {
		height = 0;
	}

	tempContext.canvas.width = width;
	tempContext.canvas.height = height;
	tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
	tempContext.drawImage(baseImage, x, y, width, height, 0, 0, width, height);

	var data = tempContext.canvas.toDataURL();
	changeImageSrc(baseImage, data);

}