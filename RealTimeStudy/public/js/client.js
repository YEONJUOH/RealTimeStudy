/**
 * http://usejsdoc.org/
 */

var tColor = "#000000";
var socket = io.connect();

var paraIndex = -1;
var flag = false;

function leaderOpen(id) {
	window.open("https://localhost:9001?num=" + id, "",
			"width=300, height=15");
}

function memOpen(id) {
	window.open("https://localhost?broadcastId=" + id, "",
			"width=300, height=15");
}

function goRed() {

	tColor = "#FF0000";
}

function goYellow() {
	tColor = "#000000";
}

function clearC() {

	socket.emit("clear", "Success");

}
var canvas = document.querySelector('canvas');
var context = null;

var rtcMode = true;

document
		.addEventListener(
				"DOMContentLoaded",
				function() {

					canvas = document.querySelector('canvas');
					context = canvas.getContext('2d');

					var recorder = new CanvasRecorder(canvas, {
						disableLogs : false
					});

					document.getElementById('rtcBtn').onclick = function() {

						if (rtcMode) {
							document.getElementById('rtcBtn').style.color = "red";
							recorder.record();
							rtcMode = false;
						} else {

							recorder.stop(function(blob) {

										var url = URL.createObjectURL(blob);
										window.open(url);
										document.getElementById('rtcBtn').style.color = "black";
										rtcMode = true;
									});

						}

					}

					var mouse = {
						click : false,
						move : false,
						pos : {
							x : 0,
							y : 0
						},
						pos_prev : false
					};
					// get canvas element and create context

					// var width = 300;
					// var width = window.innerWidth;
					// var height = 300;
					// var height = window.innerHeight;

					// set canvas to full browser width/height
					canvas.width = 900;
					canvas.height = 600;

					// register mouse event handlers
					// canvas.onmousedown = function(e){ mouse.click = true; };
					canvas.onmouseup = function(e) {
						mouse.click = false;
					};

					canvas.onmousemove = function(e) {
						// normalize mouse position to range 0.0 - 1.0
						// mouse.pos.x = e.clientX / width;

						var posC = $('#drawing').offset();
						mouse.pos.x = (e.clientX - posC.left) / canvas.width;
						// alert(mouse.pos.x);
						// mouse.pos.y = e.clientY / height;
						mouse.pos.y = (e.clientY - posC.top) / canvas.height;
						mouse.move = true;
					};

					socket.on('draw_line', function(data) {
						var line = data.line;
						context.beginPath();

						//점 들을 연결시킨다
						context.moveTo(line[0].x * canvas.width, line[0].y
								* canvas.height);

						context.lineTo(line[1].x * canvas.width, line[1].y
								* canvas.height);
						//선의 스타일
						context.strokeStyle = line[2];
						context.stroke();
					});

					socket.on('clear', function() {

						context.clearRect(0, 0, canvas.width, canvas.height);
						drawBackground();
					});

					// 25ms 마다 그리기 정보를 서버에 보낸다.
					function mainLoop() {
						
						if (mouse.click && mouse.move && mouse.pos_prev) {
							
							socket.emit('draw_line', {
								line : [ mouse.pos, mouse.pos_prev, tColor ]
							});
							mouse.move = false;
						}
						mouse.pos_prev = {
							x : mouse.pos.x,
							y : mouse.pos.y
						};
						setTimeout(mainLoop, 25);
					}
					mainLoop();

					// 추가
					var fontSelect = document.getElementById('fontSelect'), sizeSelect = document
							.getElementById('sizeSelect'), strokeStyleSelect = document
							.getElementById('strokeStyleSelect'), fillStyleSelect = document
							.getElementById('fillStyleSelect'), charCheck = document
							.getElementById('charD'),

					GRID_STROKE_STYLE = 'lightgray', GRID_HORIZONTAL_SPACING = 10, GRID_VERTICAL_SPACING = 10,

					drawingSurfaceImageData,

					cursor = new TextCursor(), paragraph;

					// General-purpose
					// functions.....................................

					function drawBackground() {
						var STEP_Y = 12, i = context.canvas.height;

						context.strokeStyle = 'rgba(0,0,200,0.225)';
						context.lineWidth = 0.5;

						context.save();
						context.restore();

						while (i > STEP_Y * 4) {
							context.beginPath();
							context.moveTo(0, i);
							context.lineTo(context.canvas.width, i);
							context.stroke();
							i -= STEP_Y;
						}

						context.save();

						context.strokeStyle = 'rgba(100,0,0,0.3)';
						context.lineWidth = 1;

						context.beginPath();

						context.moveTo(35, 0);
						context.lineTo(35, context.canvas.height);
						context.stroke();

						context.restore();
					}

					function windowToCanvas(canvas, x, y) {
						var bbox = canvas.getBoundingClientRect();

						return {
							x : x - bbox.left * (canvas.width / bbox.width),
							y : y - bbox.top * (canvas.height / bbox.height)
						};
					}

					// Drawing
					// surface...............................................

					function saveDrawingSurface() {
						drawingSurfaceImageData = context.getImageData(0, 0,
								canvas.width, canvas.height);
					}

					// Text..........................................................

					function setFont() {
						context.font = sizeSelect.value + 'px '
								+ fontSelect.value;
					}

					// Event
					// handlers................................................

					canvas.onmousedown = function(e) {

						if (charCheck.checked) {

							var loc = windowToCanvas(canvas, e.clientX,
									e.clientY), fontHeight, line;

							cursor.erase(context, drawingSurfaceImageData);
							saveDrawingSurface();
							socket.emit('savePic', "a");
							socket.emit('paraCount', "b");

							if (paragraph && paragraph.isPointInside(loc)) {

								paragraph.moveCursorCloseTo(loc.x, loc.y);
							} else if (flag) {

								fontHeight = context.measureText('W').width,
										fontHeight += fontHeight / 6;

								paragraph = new Paragraph(context, loc.x, loc.y
										- fontHeight, drawingSurfaceImageData,
										cursor, paraIndex);

								paragraph.addLine(new TextLine(loc.x, loc.y));

								flag = false;
							}
						} else {
							mouse.click = true;
						}
					};

					//paraCount
					socket.on('paraCount', function(data) {

						paraIndex = data;

						flag = true;

					});

					/*
					 * fillStyleSelect.onchange = function (e) {
					 * cursor.fillStyle = strokeStyleSelect.value; }
					 */
					strokeStyleSelect.onchange = function(e) {
						cursor.strokeStyle = strokeStyleSelect.value;
						cursor.fillStyle = strokeStyleSelect.value;
						tColor = strokeStyleSelect.value;
					}

					charCheck.onchange = function(e) {
						if (!charCheck.checked) {

							clearTimeout(paragraph.getBlink());
							cursor.erase(context, drawingSurfaceImageData);
							saveDrawingSurface();

						}

					}

					// Key event
					// handlers............................................

					// fn
					document.onkeypress = function(e) {

						if (charCheck.checked) {

							var key = String.fromCharCode(e.which);

							// Only process if user is editing text
							// and they aren't holding down the CTRL
							// or META keys.

							if (e.keyCode !== 8 && !e.ctrlKey && !e.metaKey) {
								e.preventDefault(); // no further browser
								// processing

								context.fillStyle = strokeStyleSelect.value;
								context.strokeStyle = strokeStyleSelect.value;
								
								paragraph.insert(key);

								socket.emit('printP', {
									pra : [ paragraph.getLines(),
											strokeStyleSelect.value,
											paragraph.getParaIndex() ]
								});

							}
						}
					}

					socket.on('toAllP',
							function(data) {

								//캔버스 내용 저장
								context.putImageData(drawingSurfaceImageData,
										0, 0);

								//paragraph의 lines에 대한 반복문
								for ( var i in data.pra[0]) {
									var line = data.pra[0][i];

									context.save();

									//글씨 스타일 지정
									context.fillStyle = data.pra[1];
									context.strokeStyle = data.pra[1];

									context.textAlign = 'start';
									context.textBaseline = 'bottom';

									context.strokeText(line.text, line.left,
											line.bottom);
									context.fillText(line.text, line.left,
											line.bottom);

									context.restore();

								}

							});

					socket.on('initP',
							function(data) {

								context.putImageData(drawingSurfaceImageData,
										0, 0);
								for ( var i in data.pra[0]) {

									var line = data.pra[0][i];

									context.save();

									context.fillStyle = data.pra[1];
									context.strokeStyle = data.pra[1];

									context.textAlign = 'start';
									context.textBaseline = 'bottom';

									context.strokeText(line.text, line.left,
											line.bottom);
									context.fillText(line.text, line.left,
											line.bottom);

									context.restore();

								}
								saveDrawingSurface();

							});

					socket.on('savePic', function(data) {
						saveDrawingSurface();
					});

					//resetAll
					socket.on('resetAll', function(data) {
						context.clearRect(0, 0, canvas.width, canvas.height);
						drawBackground();
						saveDrawingSurface();
					})

					// Save image
					socket.on('imgDraw', function(data) {

						// img = new Image();
						img.src = data;
						context.drawImage(img, 0, 0);
					});

					/*var tmpFlag=false;
					socket.on('moveImg', function(data) {
						tmpFlag=false;
						console.log("it's in" + data.moveData[1]);
						

					   	
					   tmpFlag = true;
					   
					   
					   
					   
					});*/

					/*
					 * socket.on('onPic',function(data){
					 * context.putImageData(data,0,0); });
					 */

					// drag 추가
					var img = document.createElement("img"), x = 0, y = 0, speed = 5;

					(function() {

						// Adding instructions

						// Image for loading
						img.addEventListener("load", function() {

							context.drawImage(img, 0, 0);
						}, false);

						// Detect mousedown

						// Detect mouseup

						// Draw, if mouse button is pressed

						// drag event
						canvas.addEventListener("dragover", function(evt) {
							evt.preventDefault();
						}, false);

						//drop event
						canvas
								.addEventListener(
										"drop",
										function(evt) {
											var files = evt.dataTransfer.files;
											if (files.length > 0) {

												var file = files[0];
												if (typeof FileReader !== "undefined"
														&& file.type
																.indexOf("image") != -1) {
													var reader = new FileReader();

													reader.onload = function(
															evt) {
														img.src = evt.target.result;

														socket
																.emit(
																		'image',
																		evt.target.result);
													};
													reader.readAsDataURL(file);
												}
											}
											evt.preventDefault();
										}, false);

						//resetAll
						socket.on('resetAll', function(data) {
							context
									.clearRect(0, 0, canvas.width,
											canvas.height);
							drawBackground();
							saveDrawingSurface();
						})

						// Save image
						/*		socket.on('imgDraw', function(data){
									

									// img = new Image();
									img.src = data;
									context.drawImage(img, 0, 0);
								});
						 */
						socket.on('moveImg', function(data) {

							console.log("it's in" + data.moveData[1]);

							context.drawImage(img, data.moveData[1],
									data.moveData[2], img.width, img.height);
						});

						document.onkeydown = function(e) {
							if (charCheck.checked) {
								if (e.keyCode === 8 || e.keyCode === 13) {
									// The call to e.preventDefault() suppresses
									// the browser's subsequent call to
									// document.onkeypress(),
									// so only suppress that call for backspace
									// and enter.
									e.preventDefault();
								}

								if (e.keyCode === 8) { // backspace

									paragraph.backspace();
									socket.emit('printP', {
										pra : [ paragraph.getLines(),
												strokeStyleSelect.value,
												paragraph.getParaIndex() ]
									});
								} else if (e.keyCode === 13) { // enter

									paragraph.newline();
									socket.emit('printP', {
										pra : [ paragraph.getLines(),
												strokeStyleSelect.value,
												paragraph.getParaIndex() ]
									});
								}
							} else {
								if (e.keyCode == 38) {
									y -= speed; //going up
									render();
								}
								if (e.keyCode == 40) {
									y += speed; //going down
									render();
								}
								if (e.keyCode == 37) {
									x -= speed; //going left
									render();
								}
								if (e.keyCode == 39) {
									x += speed; //going right
									render();
								}

							}

						}

						function render() {
							//alert(img.width);
							context
									.clearRect(0, 0, canvas.width,
											canvas.height);
							drawBackground();
							saveDrawingSurface();

							socket.emit('init', 'a');
							var tmpFlag = false;
							socket.on('endMsg', function(data) {
								tmpFlag = true;
							});

							socket.emit("moveImg", {
								moveData : [ img.src, x, y ]
							});

							/*context.drawImage(img, x, y, img.width,
									img.height);*/

							/*if (tmpFlag) {
								alert("in flag");
								context.drawImage(img, x, y, img.width,
										img.height);
							}*/
						}

					})();

					//Initialization................................................

					fontSelect.onchange = setFont;
					sizeSelect.onchange = setFont;

					cursor.fillStyle = strokeStyleSelect.value;
					cursor.strokeStyle = strokeStyleSelect.value;

					context.lineWidth = 2.0;
					setFont();

					drawBackground();
					saveDrawingSurface();
				});