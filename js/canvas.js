const textType = 'text';
const imageType = 'image';

const cloneObject = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

window.onload = function() {
	const drawingEditor = new DrawingEditor('myCanvas', 1000, 600);
	drawingEditor.addComponents([
		new LineComponent('lineDisplayComponent', drawingEditor),
		new RectangleComponent('rectangleDisplayComponent', drawingEditor),
		new OvalComponent('ovalDisplayComponent', drawingEditor),
		new TriangleComponent('triangleDisplayComponent', drawingEditor),
		new TextComponent('textDisplayComponent', drawingEditor),
		new PolylineComponent('polylineDrawerComponent', drawingEditor),
		new DeleteComponent('deleteComponent', drawingEditor)
	]);

	document.querySelector('#lineDisplayComponent').click();
	/*
	document.querySelector('#lineDisplayComponent label').classList.add('active');
	document.querySelector('#lineDisplayComponent label input').checked = true;
	*/

	/*
	const canvas = new fabric.Canvas('myCanvas', {
		width: 1000,
		height: 600,
	});
	*/
	const canvas = drawingEditor.canvas;
	const bg = new fabric.Rect({
		left: 0,
		top: 0,
		width: canvas.width,
		height: canvas.height,

		objectCaching: false,
		evented: false
	});
	canvas.add(bg);
	fabric.Image.fromURL('img/bg.jpg', (oImg) => {
		oImg.scaleToWidth(600);

		const patternSourceCanvas = new fabric.StaticCanvas();
		patternSourceCanvas.add(oImg);
		patternSourceCanvas.renderAll();

		const pattern = new fabric.Pattern({
			source: patternSourceCanvas.getElement(),
			repeat: 'repeat'
		});
		bg.fill = pattern;
		
		canvas.renderAll();
	});
	//canvas.backgroundColor = new fabric.Pattern({source: 'img/bg.jpg'});

	canvas.selection = false;

	const mousePosition = new fabric.Text('', {
		top: 0,
		left: 0,
		fontSize: 30,
		textAlign: 'center',
		borderColor: 'blue',

		evented: false
	});

	canvas.add(mousePosition);

	canvas.on('mouse:move', function(ev) {
		mousePosition.set('text', 'X: ' + ev.pointer.x + ' Y: ' + ev.pointer.y);
		mousePosition.bringToFront();
		canvas.renderAll();
	});

	//Funciones
	const cloneFabricEvent = function(ev) {
		const clickFabric = cloneObject(ev);
		if (MouseEventExisted === true) {
			clickFabric.e = new MouseEvent('click', ev.e);
		} else {
			clickFabric.e.type = 'click';
		}
		return clickFabric;
	};

	//Click Event
	const canvasClick = function(ev) {
		const clickFabric = cloneFabricEvent(ev);
		canvas.fire('mouse:click', clickFabric);
	};

	const objectClick = function(ev) {
		ev.target.fire('mouse:click', ev);
	};

	//For Canvas
	canvas.on('mouse:down', function() {
		canvas.off('mouse:up', canvasClick);
		canvas.on('mouse:up', canvasClick);
	});
	canvas.on('mouse:move', function() {
		canvas.off('mouse:up', canvasClick);
	});

	//For objects
	canvas.on('object:added', function(ev) {
		const obj = ev.target;
		obj.on('mousedown', function() {
			obj.off('mouseup', objectClick);
			obj.on('mouseup', objectClick);
		});
		canvas.on('mouse:move', function() {
			obj.off('mouseup', objectClick);
		});
	});

	const createButtonOld = function(oImg, callback) {//oImg is a fabric.Image
		//oImg.scaleToWidth(24);
		oImg.scaleToHeight(24);

		oImg.selectable = false;

		if (callback !== undefined) {
			oImg.on('mouseup', callback);
		}

		canvas.add(oImg);
		//canvas.renderAll();
	};

	const createButton = function(options) {
		//console.log(options);
		let text = undefined;
		let source = undefined;
		if (options.text !== undefined) {
			text = options.text.text;
		}
		if (options.img !== undefined) {
			source = options.img.source;
		}
		
		return new Promise((resolve, reject) => {
			if (text === undefined && source === undefined) {
				reject('Text or image source is required');
			} else {
				resolve();
			}
		}).then(() => {
			return new Promise((resolve, reject) => {
				if (source !== undefined) {
					const height = options.img.height;
					options.img.source = undefined;
					options.img.height = undefined;
					fabric.Image.fromURL(source, function(oImg, isError) {
						if (isError) {
							reject('Cannot load image from source');
						} else {
							if (height !== undefined && height > 0) {
								oImg.scaleToHeight(height);
							}
							resolve(oImg);
						}
					}, options.img);
				} else {
					resolve(undefined);
				}
			});
		}).then((oImg) => {
			return new Promise((resolve, reject) => {
				let oText;
				if (text !== undefined) {
					oText = new fabric.Text(undefined, options.text);
				}
				if (text !== undefined && source !== undefined) {
					let group = new fabric.Group([oImg, oText], options.group);
					//group._calcBounds();
					if (options.group.backgroundColor !== undefined) {
						const boundingRect = group.getBoundingRect();
						//console.log(boundingRect);
						const bgGroup = new fabric.Rect({
							top: boundingRect.top,
							left: boundingRect.left,
							width: boundingRect.width,
							height: boundingRect.height,
							fill: options.group.backgroundColor
						});
						group = new fabric.Group([bgGroup, group]);
						//group._calcBounds();
					}
					resolve(group);
				} else if (text !== undefined) {
					resolve(oText);
				} else {
					resolve(oImg);
				}
			});
		}).then((oButton) => {
			oButton.selectable = false;
			oButton.hoverCursor = 'pointer';

			const actionListener = options.actionListener;
			if (actionListener !== undefined) {
				oButton.on('mouseup', actionListener);
			}

			canvas.add(oButton);
			return Promise.resolve(oButton);
		});
	};

	//Imagen
	const formFile = document.createElement('form');

	const fileSelector = document.createElement('input');
	fileSelector.setAttribute('type', 'file');

	const resetButton = document.createElement('button');
	resetButton.setAttribute('type', 'reset');

	formFile.appendChild(fileSelector);
	formFile.appendChild(resetButton);

	//document.querySelector('#prueba').appendChild(formFile);

	fileSelector.onchange = function(ev) {
		const archivos = ev.target.files;
		if (archivos.length > 0) {
			fabric.Image.fromURL(URL.createObjectURL(archivos[0]), function(oImg) {
				oImg.lockRotation = true;
				oImg.hasRotatingPoint = false;
				oImg.lockScalingFlip = true;
				if (oImg.width >= oImg.height) {
					oImg.scaleToWidth(500);
				} else {
					oImg.scaleToHeight(500);
				}
				canvas.add(oImg);
				canvas.centerObject(oImg);
				canvas.setActiveObject(oImg);
				//canvas.renderAll();
				resetButton.click();
				console.log(1);
			});
		}
	};

	createButton({
		img: {
			source: 'img/image.png',
			top: 30,
			left: 0,
			backgroundColor: 'blue',
			height: 24
		},
		actionListener: function() {
			fileSelector.click();
		}
	});

	createButton({
		img: {
			source: 'img/text.png',
			top: 30,
			left: 50,
			backgroundColor: 'blue',
			height: 24
		},
		actionListener: function() {
			const text = new fabric.Textbox('Texto', {
				top: 100,
				left: 100,
				fontSize: 30,
				textAlign: 'center',
				borderColor: 'blue',
				lockScalingX: true,
				lockScalingY: true
			});
			canvas.add(text);
			canvas.setActiveObject(text);
		}
	});
	const addActiveObjectListener = (function() {
		const map = new Map();

		let activeObject = undefined;

		canvas.on('selection:cleared', function(ev) {
			activeObject = ev.deselected[0];
		});
		canvas.on('mouse:up', (ev) => {
			//console.log(activeObject);
			const target = ev.target;
			if (activeObject !== undefined && target !== undefined && map.has(target) === true) {
				const actionListener = map.get(target);
				actionListener(activeObject);
			}
			activeObject = undefined;
		});
		return function(oFabric, actionListener) {
			map.set(oFabric, actionListener);
		};
	})();

	createButton({
		img: {
			source: 'img/delete.png',
			top: 100,
			left: 0,
			backgroundColor: 'blue',
			height: 24
		}
	}).then((oButton) => {
		addActiveObjectListener(oButton, (activeObject) => {
			canvas.remove(activeObject);
		});
		/*
		let activeObject = undefined;

		canvas.on('selection:cleared', function(ev) {
			activeObject = ev.deselected[0];
		});
		canvas.on('mouse:up', (ev) => {
			//console.log(activeObject);
			if (activeObject !== undefined && ev.target == oButton) {
				canvas.remove(activeObject);
			}
			activeObject = undefined;
		});
		*/
	});

	createButton({
		img: {
			source: 'img/front.png',
			top: 0,
			left: 0,
			height: 24
		},
		text: {
			text: 'Traer al frente',
			top: 0,
			left: 24,
			fontSize: 24,
			textAlign: 'center',
			borderColor: 'blue'
		},
		group: {
			top: 30,
			left: 100,
			backgroundColor: 'blue',
		}
	}).then((oButton) => {
		addActiveObjectListener(oButton, (activeObject) => {
			activeObject.bringToFront();
		});
	});


	function createMenu() {
		const menu = new fabric.Group([], {
			top: 100,
			left: 100,
			hoverCursor: 'default',
			backgroundColor: 'red',
			opacity: 0,
			subTargetCheck: true
		});

		menu.lockRotation = true;
		menu.lockScalingX = true;
		menu.lockScalingY = true;
		menu.hasBorders = false;
		menu.hasControls = false;

		return menu;
	}

	//Menu
	const menuAll = createMenu();
	const menuText = createMenu();
	const menuImage = createMenu();
	const menuActive = undefined;

/*
	canvas.on('object:added', function(ev) {
		var obj = ev.target;
		if (obj.get('selectable') == true) {
			obj.on('selected', function() {
				var type = obj.get('type');
				if (type == textType) {
					menuActive = menuText;
				} else if (type == imageType) {
					menuActive = menuImage;
				} else {
					return;
				}
				canvas.add(menuActive);
				menuActive.animate('opacity', 1, {
					from: 0,
					onChange: canvas.renderAll.bind(canvas)
				});
			});
			obj.on('deselected', function() {
				if (menuActive == undefined) {
					menuActive.animate('opacity', 0, {
						from: 1,
						onChange: canvas.renderAll.bind(canvas),
						onComplete: function() {
							canvas.remove(menuActive);
							menuActive = undefined;
						}
					});
				}
			});
		}
	});
*/
}