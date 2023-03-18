//Enums
const DrawingMode = (function() {
	let index = 0;
	return class DrawingMode {
		static LINE = new DrawingMode('LINE');
		static RECTANGLE = new DrawingMode('RECTANGLE');
		static OVAL = new DrawingMode('OVAL');
		static TRIANGLE = new DrawingMode('TRIANGLE')
		static TEXT = new DrawingMode('TEXT');
		static POLYLINE = new DrawingMode('POLYLINE');
		static PATH = new DrawingMode('PATH');

		constructor(name) {
			this.name = name;
			let _index = index++;
			Object.defineProperty(this, 'index', {
				get: function() {
					return _index;
				}
			});
		};
	};
})();

const CursorMode = (function() {
	let index = 0;
	return class CursorMode {
		static DRAW = new CursorMode('DRAW');
		static SELECT = new CursorMode('SELECT');

		constructor(name) {
			this.name = name;
			let _index = index++;
			Object.defineProperty(this, 'index', {
				get: function() {
					return _index;
				}
			});
		};
	};
})();

const Color = (function() {
	let index = 0;
	return class Color {
		constructor(code, text) {
			this.code = code;
			this.text = text;
			let _index = index++;
			Object.defineProperty(this, 'index', {
				get: function() {
					return _index;
				}
			});
		};
	};
})();

const ImageDropdownStyle = (function() {
	let index = 0;
	return class CursorMode {
		static FILL = new CursorMode('FILL');
		static COPY = new CursorMode('COPY');

		constructor(name) {
			this.name = name;
			let _index = index++;
			Object.defineProperty(this, 'index', {
				get: function() {
					return _index;
				}
			});
		};
	};
})();

//OptionsObject
class IComponentOptions {
	constructor(options) {
		this.hoverText = options.altText;
		this.svg = options.svg;
		this.cssClass = options.classNames;
	};
};

class IDrawerComponentOptions extends IComponentOptions {
	constructor(options) {
		super(options);
		this.childName = options.childName;
	};
};

class ImageDropdownOptions extends IComponentOptions {
	constructor(options) {
		super(options);
		this.selectedStyle = options.selectedStyle;
		this.width = options.width;
		this.childWidth = options.childWidth;
		this.selectedIndex = options.selectedIndex;
		this.optionsList = options.optionsList;
		this.handlers = options.handlers;
	};
};

//Componentes
class IComponent {
	constructor(targetId, parent, options) {
		this.targetId = targetId;
		this.canvasDrawer = parent;
		this.hoverText = options.altText;
		this.svg = options.svg;
		this.cssClass = options.classNames;
	};
	_init() {
		this.render();
		this.attachEvents();
	};
	render() {
		throw new TypeError(this.constructor.name + '.render necesita ser definida');
	};
	_iconStr() {
		if (this.cssClass != null) {
			return `<i class="${this.cssClass}"></i>`;
		} else {
			return this.svg;
		}
	};
	attachEvents() {
		throw new TypeError(this.constructor.name + '.attachEvents necesita ser definida');
	};
};

class IDrawerComponent extends IComponent {
	constructor(mode, targetId, parent, options) {
		super(targetId, parent, options);
		this.drawingMode = mode;
		this.childName = options.childName;
		this._init();
	};
	//Dibujado
	make(x, y, options, x2, y2) {
		throw new TypeError(this.constructor.name + '.make necesita ser definida');
	};
	resize(oFabric, x, y) {
		throw new TypeError(this.constructor.name + '.resize necesita ser definida');
	};
	//Controles
	render() {
		const html = `<label id="${this.targetId}" class="btn btn-primary text-light" title="${this.hoverText}">
			<input type="radio" name="options" autocomplete="off">
			${this._iconStr()}
			</label>`;
		document.getElementById(this.targetId).outerHTML = html;
		//document.getElementById(this.targetId).innerHTML = html;
	};
	attachEvents() {
		/*
		const data = {
			mode: this.drawingMode,
			container: this.canvasDrawer,
			targetId: this.targetId
		};
		*/
		//console.log('#' + this.targetId + ' input', document.querySelector('#' + this.targetId + ' input'));
		document.querySelector('#' + this.targetId + ' input').addEventListener('click', (ev) => {
			//console.log('targetId', this.targetId);
			//console.log('click in', ev.target);
			//data.container.drawingMode = data.mode;
			//console.log(this);
			this.canvasDrawer.componentSelected(this);
		});
	};
	selectedChanged(drawerComponent) {}
};

class LineComponent extends IDrawerComponent {
	constructor(targetId, parent) {
		super(DrawingMode.LINE, targetId, parent, {
			altText: 'Line',
			svg: `<svg width="13px" height="15px" viewBox="2 0 13 17">
					<line x1="0" y1="13" x2="13" y2="0" stroke="white" stroke-width="2px" />
				</svg>`
		});
	};
	make(x, y, options, x2, y2) {
		return new Promise((resolve, reject) => {
			resolve(new fabric.Line([x, y, x2, y2], options));
		});
	};
	resize(oFabric, x, y) {
		return new Promise((resolve, reject) => {
			oFabric.set({
				x2: x,
				y2: y
			}).setCoords();
			resolve(oFabric);
		});
	};
};

class RectangleComponent extends IDrawerComponent {
	constructor(targetId, parent) {
		super(DrawingMode.RECTANGLE, targetId, parent, {
			altText: 'Rectangle',
			classNames: 'fa-regular fa-square',
			childName: null
		});
	};
	make(x, y, options, width, height) {
		return new Promise((resolve, reject) => {
			this._origX = x;
			this._origY = y;

			resolve(new fabric.Rect({
				left: x,
				top: y,
				width: width,
				height: height,
				fill: 'transparent',
				...options
			}));
		});
	};
	resize(oFabric, x, y) {
		return new Promise((resolve, reject) => {
			oFabric.set({
				originX: this._origX > x ? 'right' : 'left',
				originY: this._origY > y ? 'bottom' : 'top',
				width: Math.abs(this._origX - x),
				height: Math.abs(this._origY - y)
			}).setCoords();
			resolve(oFabric);
		});
	};
};

class OvalComponent extends IDrawerComponent {
	constructor(targetId, parent) {
		super(DrawingMode.OVAL, targetId, parent, {
			altText: 'Oval',
			classNames: 'fa-regular fa-circle',
			childName: null
		});
	};
	make(x, y, options, rx, ry) {
		return new Promise((resolve, reject) => {
			this._origX = x;
			this._origY = y;

			resolve(new fabric.Ellipse({
				left: x,
				top: y,
				rx: rx,
				ry: ry,
				fill: 'transparent',
				...options
			}));
		});
	};
	resize(oFabric, x, y) {
		return new Promise((resolve, reject) => {
			oFabric.set({
				originX: this._origX > x ? 'right' : 'left',
				originY: this._origY > y ? 'bottom' : 'top',
				rx: Math.abs(x - oFabric.left) / 2,
				ry: Math.abs(y - oFabric.top) / 2
			}).setCoords();
			resolve(oFabric);
		});
	};
};

class TriangleComponent extends IDrawerComponent {
	constructor(targetId, parent) {
		super(DrawingMode.TRIANGLE, targetId, parent, {
			altText: 'Triangle',
			svg: `<svg width="13px" height="15px" viewBox="0 0 20 20">
					<line x1="0" y1="20" x2="10" y2="0" 
					stroke="white" stroke-width="2px" />
					<line x1="10" y1="0" x2="20" y2="20" 
					stroke="white" stroke-width="2px" />
					<line x1="0" y1="20" x2="20" y2="20" 
					stroke="white" stroke-width="2px" />
				</svg>`,
		});
	};
	make(x, y, options, width, height) {
		return new Promise((resolve, reject) => {
			this._origX = x;
			this._origY = y;

			resolve(new fabric.Triangle({
				left: x,
				top: y,
				width: width,
				height: height,
				fill: 'transparent',
				...options
			}));
		});
	};
	resize(oFabric, x, y) {
		return new Promise((resolve, reject) => {
			oFabric.set({
				originX: this._origX > x ? 'right' : 'left',
				originY: this._origY > y ? 'bottom' : 'top',
				width: Math.abs(this._origX - x),
				height: Math.abs(this._origY - y)
			}).setCoords();
			resolve(oFabric);
		});
	};
};

class TextComponent extends IDrawerComponent {
	constructor(targetId, parent) {
		super(DrawingMode.TEXT, targetId, parent, {
			altText: 'Text',
			classNames: 'fa-solid fa-font',
			childName: 'textComponentInput'
		});
	};
	make(x, y, options) {
		return new Promise((resolve, reject) => {
			const text = document.getElementById('textComponentInput').value;
			if (text !== '') {
				const textFabric = new fabric.Text(text, {
					left: x,
					top: y,
					...options
				});
				console.log(textFabric);
				resolve(textFabric);
			} else {
				reject('input must have value');
			}
		});
	};
	resize(oFabric, x, y) {
		return new Promise((resolve, reject) => {
			if (oFabric === undefined) {
				reject('fabric object not created');
			} else {
				oFabric.set({
					left: x,
					top: y
				}).setCoords();
				resolve(oFabric);
			}
		});
	};

	render() {
		super.render();
		const textInput = document.createElement('input');
		textInput.id = this.childName;
		textInput.classList.add('col-sm-6', 'form-control', 'd-none');
		document.getElementById(this.targetId).parentNode.appendChild(textInput);
	};

	selectionUpdated(newTarget) {
		document.querySelector(newTarget).classList.remove('d-none');
	};
	selectedChanged(drawerComponent) {
		const child = document.getElementById(this.childName);
		if (this.targetId === drawerComponent.targetId) {
			child.classList.remove('d-none');
		} else {
			child.classList.add('d-none');
		}
	};
};

class PolylineComponent extends IDrawerComponent {
	constructor(targetId, parent) {
		super(DrawingMode.POLYLINE, targetId, parent, {
			altText: 'Pencil',
			classNames: 'fa-solid fa-pencil',
			childName: null
		});
	};
	make(x, y, options, rx, ry) {
		return new Promise((resolve, reject) => {
			resolve(new fabric.Polyline([{x, y}], {
				fill: 'transparent',
				...options
			}));
		});
	};
	resize(oFabric, x, y) {
		return new Promise((resolve, reject) => {
			oFabric.points.push(new fabric.Point(x, y));
			const dim = oFabric._calcDimensions();
			oFabric.set({
				left: dim.left,
				top: dim.top,
				width: dim.width,
				height: dim.height,
				dirty: true,
				pathOffset: new fabric.Point(dim.left + dim.width / 2, dim.top + dim.height / 2)
			}).setCoords();
			resolve(oFabric);
		});
	};
};

class IControlComponent extends IComponent {
	constructor(targetId, parent, handlers, options) {
		super(targetId, parent, options);
		this.handlers = handlers;
		this._init();
	};
	attachEvents() {
		if (this.handlers['click'] !== undefined) {
			document.getElementById(this.targetId).addEventListener('click', () => {
				this.handlers['click']();
			});
		}
		if (this.handlers['change'] !== undefined) {
			console.log('this', this);
			document.getElementById(targetId).addEventListener('change', () => {
				console.log('this', this);
				this.handlers['change']();
			});
		}
	};
};

class DeleteComponent extends IControlComponent {
	constructor(targetId, parent) {
		super(targetId, parent, {
			click: () => { parent.deleteSelected() }
		}, {
			altText: 'Delete Selected Item',
			classNames: 'fa-solid fa-trash'
		});
	};
	render() {
		const html = `<button id="${this.targetId}"
			title="${this.hoverText}" disabled class="btn btn-danger">
			${this._iconStr()}
			</button>`;
		document.getElementById(this.targetId).outerHTML = html;
	};
	enable() {
		const el = document.getElementById(this.targetId);
		el.disabled = false;
	};
	disable() {
		const el = document.getElementById(this.targetId);
		el.disabled = true;
	};
};

class ImageDropdown extends IControlComponent {
	constructor(targetId, parent, handlers, options) {
		super(targetId, parent, handlers, options);
		/*
		this.targetId = targetId;
		this.element = document.getElementById(targetId);
		this.handlers = options.handlers;
		this.render();
		this.attachEvents();
		*/
	};
	render() {
		this.element.outerHTML = `<div id="${this.targetId}" class="imageDropdown">
				<div style="width: ${this.options.width}px">
					${this.renderSelected()}
					<i class="fa-regular fa-square-caret-down"></i>
				</div>
				<ul class="hidden" style="width: ${this.options.childWidth || this.options.width}px">
					${this.renderOptions()}
				</ul>
			</div>`;
	};
	renderSelected() {
		switch (this.options.selectedStyle) {
			case ImageDropdownStyle.COPY:
				return `<div id="${this.targetId}_selected" style="width: ${this.options.width - 20}px">
						${this.options.optionsList[this.options.selectedIndex].display}
					</div>`;
			case ImageDropdownStyle.FILL:
				return `<div id="${this.targetId}_selected" style="width: ${this.options.width - 20}px; height: 20px; background-color: ${this.options.optionsList[this.optionsList.selectedIndex].value}">
						<span></span>
					</div>`;
		}
	};
	renderOptions() {
		let output = '';
		this.options.optionsList.forEach((record) => {
			switch (this.options.selectedStyle) {
				case ImageDropdownStyle.COPY:
					output += `<li class="vertical" title="${record.text}">${record.display}</li>`;
					break;
				case ImageDropdownStyle.FILL:
					output += `<li class="horizontal" title="${record.text}">${record.display}</li>`;
					break;
			}
		});

		return output;
	};
	attachEvents() {
		const container = this;
		const selectedDiv = this.element.children[0];
		const list = this.element.children[1];
		const options = [...list.children];

		selectedDiv.addEventListener('click', () => {
			if (list.classList.contains('hidden')) {
				list.classList.remove('hidden');
			} else {
				list.classList.add('hidden');
			}
		});
		options.forEach((element, index) => {
			element.addEventListener('click', (ev) => {
				const selected = this.options.optionsList[index];
				list.classList.add('hidden');
				console.log('this', this);
				console.log('container', container);
				if (container.value !== selected.value) {
					switch (container.options.selectedStyle) {
						case ImageDropdownStyle.COPY:
							selectedDiv.children[0].innerHTML = selected.display;
							container.value = selected.value;
							break;
						case ImageDropdownStyle.FILL:
							selectedDiv.children[0].style.backgroundColor = selected.value;
							container.value = selected.value;
							break;
					}
					if (container.handlers['change'] !== undefined) {
						container.handlers['change'](this.value);
					}
				}
			});
		});
	};
};

class ColorChooserComponent extends ImageDropdown {
	constructor(targetId, parent, defaultColor, handlers) {
		super(targetId, parent, handlers);
		this._colors = [
			new Color('', 'Transparent'),
			new Color('#FFFFFF', 'White'),
			new Color('#C0C0C0', 'Silver'),
			new Color('#808080', 'Gray'),
			new Color('#000000', 'Black'),
			new Color('#FF0000', 'Red'),
			new Color('#800000', 'Maroon'),
			new Color('#FFFF00', 'Yellow'),
			new Color('#808000', 'Olive'),
			new Color('#00FF00', 'Lime'),
			new Color('#008000', 'Green'),
			new Color('#00FFFF', 'Aqua'),
			new Color('#008080', 'Teal'),
			new Color('#0000FF', 'Blue'),
			new Color('#000080', 'Navy'),
			new Color('#FF00FF', 'Fuchsia'),
			new Color('#800080', 'Purple')
		];
		this.render();
	};
	render() {
		const def = this._colors.filter((c) => {
			if (c.code === this.defaultColor) {
				return c;
			}
		});
		const opt = {
			selectedStyle: ImageDropdownStyle.FILL,
			selectedIndex: def[0].key,
			width: 50,
			childWidth: 153,
			optionsList: this.getOptions(),
			handlers: this.handlers
		};
		new ImageDropdown(this.target, opt);
	};
};

//Drawing class
class DrawingEditor {
	constructor(selector, width, height) {
		this.canvas = new fabric.Canvas(selector, {
			width: width,
			height: height
		});
		this._drawerComponent;
		this.drawerOptions = {
			stroke: 'black',
			strokeWidth: 1,
			selectable: true,
			strokeUniform: true
		};
		this._oFabric;
		this._isDown = false;//Is dragging the mouse?
		this._cursorMode = CursorMode.DRAW;
		this.drawerComponents = [];
		this.controlComponents = {};

		this._initializeCanvasEvents();
	};
	_initializeCanvasEvents() {
		this.canvas.on('mouse:down', (o) => {
			const pointer = this.canvas.getPointer(o.e);
			this._mouseDown(pointer.x, pointer.y);
		});
		this.canvas.on('mouse:move', (o) => {
			const pointer = this.canvas.getPointer(o.e);
			this._mouseMove(pointer.x, pointer.y);
		});
		this.canvas.on('mouse:up', (o) => {
			this._isDown = false;
		});
		this.canvas.on('selection:created', (o) => {
			this._cursorMode = CursorMode.SELECT;
			this._oFabric = o.target;
			if (this.controlComponents['delete'] !== undefined) {
				this.controlComponents['delete'].enable();
			}
		});
		this.canvas.on('selection:updated', (o) => {
			this._oFabric = o.target;
		});
		this.canvas.on('selection:cleared', (o) => {
			this._cursorMode = CursorMode.DRAW;
			if (this.controlComponents['delete'] !== undefined) {
				this.controlComponents['delete'].disable();
			}
		});
	};
	//Mouse Events
	_mouseDown(x, y) {
		this._isDown = true;
		if (this._cursorMode !== CursorMode.DRAW) {
			return;
		}
		this._drawerComponent.make(x, y, this.drawerOptions)
			.then((o) => {
				this._oFabric = o;
				this.canvas.add(this._oFabric);
				this.canvas.renderAll();
			}, (err) => {
				console.log('Error:', err);
			});
	};
	_mouseMove(x, y) {
		if (!(this._cursorMode === CursorMode.DRAW && this._isDown)) {
			return;
		}
		this._drawerComponent.resize(this._oFabric, x, y)
			.then(() => {
				this.canvas.renderAll();
			}, (err) => {
				console.log('Error:', err);
			});
	};

	addComponents(drawerComponentList) {
		if (Array.isArray(drawerComponentList)) {
			drawerComponentList.forEach((drawerComponent) => {
				this.addComponent(drawerComponent);
			});
		}
	};
	addComponent(component) {
		if (component instanceof IDrawerComponent) {
			this.drawerComponents.push(component);
		} else if (component instanceof IControlComponent) {
			const nameIndex = component.constructor.name.toLowerCase().replace('component', '');
			this.controlComponents[nameIndex] = component;
		} else {
			console.log('Not an Component');
		}
		/*
		switch (componentType) {
			case 'line':
				this.components[componentType] = [new LineDisplayComponent(targetId, this)];
				break;
			case 'rect':
				this.components[componentType] = [new RectangleDisplayComponent(targetId, this)];
				break;
		}
		*/
	};

	componentSelected(drawerComponent) {
		this.canvas.discardActiveObject();
		this._drawerComponent = drawerComponent;
		this.drawerComponents.forEach((c) => {
			if (c.selectedChanged !== undefined) {
				c.selectedChanged(this._drawerComponent);
			}
		});

		/*
		for (const key in this.components) {
			if (!this.components.hasOwnProperty(key)) {
				continue;
			}
			const obj = this.components[key];

			if (obj[0].targetId === targetId) {
				this._drawer = this._drawers[obj[0].drawingMode.index];
			}

			if (obj[0].selectedChanged !== undefined) {
				obj[0].selectedChanged(targetId);
			}
		}
		*/
	};
	deleteSelected() {
		this.canvas.remove(this.canvas.getActiveObject());
		this.canvas.renderAll();
	};
};