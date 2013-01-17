(function(window, undefined) {
	'use strict';

	// Quick references to window properties
	var document = window.document,

	userAgent = window.navigator.userAgent,

	// Flag not to run dom ready callbacks twice
	_domReady = false,

	// This array callbacks triggers on DOMContentLoaded event
	_domReadyCallbacks = [],

	// Regular expression to match selectors
	_isClass = /^\.[-\w]+$/i,
	_isId = /^#[-\w]+$/i,
	_isTag = /^[a-z0-9]+$/i,

	// Type names to create type check methods (f.isArray, f.isFunction...)
	_objectTypes = ['Array', 'Function', 'Object', 'String', 'Number', 'HTMLCollection'],

	// Apply unique id for every event handler
	_handlerId = 0,

	//Shortcut for native prototype methods
	// Use them in case browser support them
	_slice = Array.prototype.slice,

	_trim = String.prototype.trim;

	//------------- Privet methods -----------------
	// Main FastJs method f()
	function f(selector) {
		// If selector '', 0, null or undefined
		if(!selector) {
			return null;
		}

		if(selector === document || selector === window) {
			return selector;
		}

		if(typeof selector === 'function') {
			_domReadyCallbacks[_domReadyCallbacks.length] = selector;
			return;
		}

		// Get selector type and query string
		selector = _getSelector(selector);
		return _find(document, selector);
	};

	function _triggerReadyCallback() {
		if(!_domReady) {
			_domReady = true;
			var length = _domReadyCallbacks.length,
			i = 0;

			for(; i < length; i++) {
				_domReadyCallbacks[i]();
			}
		}
	};

	function _detectBrowser() {
		var browser = {};
		if(userAgent.indexOf('MSIE') !== -1) browser.msie = true;
		if(userAgent.indexOf('Firefox') !== -1) browser.firefox = true;
		if(userAgent.indexOf('Opera') !== -1) browser.opera = true;
		if(userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Safari') !== -1) browser.chrome = true;
		if(userAgent.indexOf('Chrome') === -1 && userAgent.indexOf('Safari') !== -1) browser.safari = true;

		if(browser.msie !== undefined) browser.version = userAgent.match(/MSIE ([0-9\.]+);/)[1];
		if(browser.firefox !== undefined) browser.version = userAgent.match(/Firefox\/([0-9\.]+)/)[1];
		if(browser.chrome !== undefined) browser.version = userAgent.match(/Chrome\/([0-9\.]+)/)[1];
		if(browser.safari !== undefined) browser.version = userAgent.match(/Version\/([0-9\.]+)/)[1];
		if(browser.opera !== undefined) browser.version = userAgent.match(/Version\/([0-9\.]+)/)[1];

		return browser;
	};

	function _getSelector(selector) {
		if(selector) {
			if(_isId.test(selector)) {
				return {type: 'id', query: selector.substr(1)};
			}
			else if(_isClass.test(selector)) {
				return {type: 'class', query: selector.substr(1)};
			}
			else if(_isTag.test(selector)) {
				return {type: 'tag', query: selector.toUpperCase()};
			}
			else {
				return {type: 'query', query: selector};
			}
		}
		return null;
	};

	// Method gets all parents or by selector
	// If closest is true return the first parent by selector
	function _getParents(element, selector, closest) {
		var parents = [];
		if(selector) {
			var type = selector.type,
			query = selector.query;
		}

		while(element.parentNode && element.parentNode.nodeType === 1) {
			var parentNode = element.parentNode,
			length = parents.length;

			if(selector) {
				if(type == 'id' && parentNode.id === query) {
					parents[length] = parentNode;
				}
				else if(type == 'class' && new RegExp('( |^)' + query + '( |$)').test(parentNode.className)) {
					parents[length] = parentNode;
				}
				else if(type == 'tag' && parentNode.tagName === query) {
					parents[length] = parentNode;
				}

				// if needs closest returns the first parent element
				if(closest && parents.length === 1) {
					return parents;
				}
			}
			else {
				parents[length] = parentNode;
			}
			element = element.parentNode;
		}
		return parents;
	};

	// Get all children or by selector
	function _getChildren(element, selector) {
		var children = [],
		allChildren = element.childNodes,
		length = allChildren.length,
		i = 0;

		if(selector) {
			var type = selector.type,
			query = selector.query;
		}

		for(; i < length; i++) {
			var item = allChildren[i],
			len = children.length;
			if(allChildren[i].nodeType === 1) {
				if(selector) {
					if(type === 'id' && item.id === query) {
						children[len] = item;
					}
					else if(type == 'class' && new RegExp('( |^)' + query + '( |$)').test(item.className)) {
						children[len] = item;
					}
					else if(type == 'tag' && item.tagName === query) {
						children[len] = item;
					}
				}
				else {
					children[len] = item;
				}
			}
		}
		return children;
	};

	// Use native slice method to make result an array
	// It allows you concat results of f() method with selectors
	function _find(element, selector) {
		if(selector) {
			if(selector.type == 'class') {
				if(document.getElementsByClassName) {
					return _slice.call(element.getElementsByClassName((selector.query)), 0);
				}
				else if(document.querySelectorAll){
					return _slice.call(element.querySelectorAll('.' + selector.query), 0);
				}
			}
			else if(selector.type == 'tag') {
				return _slice.call(element.getElementsByTagName(selector.query), 0);
			}
			else if(selector.type == 'id') {
				// If element is document use getElementById
				// This is the fastest way to get element by id
				if(element === document) {
					var elem = document.getElementById(selector.query);
					return elem ? [elem] : [];
				}
				else {
					_slice.call(element.querySelectorAll('#' + selector.query), 0);
				}
			}
			else if(selector.type == 'query') {
				return _slice.call(element.querySelectorAll(selector.query), 0);
			}
		}
		return [];
	};

	// Remove element properties before remove and replace them
	// Preventing memory leak
	function _removeData(element) {
		var length = element.length,
		i = 0

		for(; i < length; i++) {
			var elem = element[i];
			if(elem.events) {
				try {
					delete elem.events;
				}
				catch(e) {
					elem.removeAttribute('events');
				}
			}
		}
	};

	/******** Events ******/
	function _attachEvent(element, selector, type, handler) {
		// Return if element is text or comment node
		if(element.nodeType == 3 || element.nodeType == 8 || !type || !handler) {
			return;
		}

		// Apply unique id for each handler
		if(!handler.handlerId) {
			handler.handlerId = ++_handlerId;
		}

		if(!element.events) {
			element.events = {};

			element.handle = function(event) {
				return _execHandlers.call(element, event);
			};
		}

		var events = element.events;
		if(selector) {
			if(!events['live']) {
				events['live'] = {};
				element.liveHandler = function(event) {
					return _liveEvent.call(element, event);
				}
			}
			events = events.live;
		}

		if(!events[type]) {
			events[type] = {};

			if(element.addEventListener) {
				element.addEventListener(type, (selector ? element.liveHandler : element.handle), false);
			}
			else if(element.attachEvent) {
				element.attachEvent('on' + type, (selector ? element.liveHandler : element.handle));
			}
		}

		if(selector) {
			handler.selector = selector;
			element.events.live[type][handler.handlerId] = handler;
		}
		else {
			element.events[type][handler.handlerId] = handler;
		}
	};

	function _execHandlers(event) {
		event = _adjustEvent(event);
		var handlers = this.events[event.type];

		for(var i in handlers) {
			// if handler returns false prevent default behaviour
			if(handlers[i].call(this, event) === false) {
				event.preventDefault();
				event.stopPropagation();
			}

			// stopNow property stops run of all the rest handlers
			if(event.stopNow) {
				break;
			}
		}
	};

	// Normalize event properties
	// Make them cross browser
	function _adjustEvent(event) {
		event = event || window.event;

		if(event.isFixed) {
			return event;
		}

		event.isFixed = true;
		event.preventDefault = event.prevetDefault || function() { this.returnValue = false; };
		event.stopPropagation = event.stopPropagation || function() { this.cancelBubble = true };

		if(!event.target) {
			event.target = event.srcElement;
		}

		if(!event.relatedTarget && event.fromElement) {
			event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
		}

		if(event.pageX == null && event.clientX != null) {
			var html = document.documentElement,
			body = document.body;
			event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
			event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
		}

		if(!event.which && event.button) {
			event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0 )));
		}
		return event;
	};

	function _removeEvent(element, selector, type, handler) {
		if(!element.events) {
			return;
		}

		var events = element.events,
		handlers,
		id;

		if(!handler && !selector) {
			if(events[type]) {
				for(id in events[type]) {
					delete events[type][id];
				}
			}

			if(events.live && events.live[type]) {
				for(id in events.live[type]) {
					delete events.live[type][id];
				}
			}
			handlers = true;
		}

		if(selector) {
			handlers = events.live && events.live[type];
			for(id in handlers) {
				if(selector === handlers[id].selector) {
					delete handlers[id];
				}
			}
		}

		if(handler && !selector) {
			handlers = events[type];
			delete handlers[handler.handlerId];
		}

		if(!handlers) {
			return;
		}

		if(handlers !== true) {
			for(id in handlers) {
				return;
			}
		}

		if(element.removeEventListener) {
			element.removeEventListener(type, (selector ? element.liveHandler : element.handle), false);
		}
		else if(element.detachEvent) {
			element.detachEvent('on' + type, (selector ? element.liveHandler : element.handle));
		}

		if(handlers !== true) {
			if(selector) {
				delete events.live[type];
			}

			if(handler && !selector) {
				delete events[type];
			}
		}
		else {
			if(events.live && events.live[type]) {
				delete events.live[type];
			}

			if(events[type]) {
				delete events[type];
			}
		}

		if(events.live) {
			for(id in events.live) {
				return;
			}
			delete events['live'];
		}

		for(id in events) {
			return;
		}

		try {
			delete element.handle;
			delete element.events;
			delete element.liveHandler;
		}
		catch(e) {
			element.removeAttribute('handle');
			element.removeAttribute('events');
			element.removeAttribute('liveHandler');
		}
	};

	function _liveEvent(event) {
		event = _adjustEvent(event);
		var parent = this,
		handlers = this.events.live[event.type],
		selectedElements = [];

		for(var i in handlers) {
			var handler = handlers[i],
			elements = f.find(parent, handler.selector),
			length = elements.length,
			c = 0;

			for(; c < length; c++) {
				var element = elements[c];
				if(element == event.target) {
					selectedElements[selectedElements.length] = {elem: element, fn: handler};
				}
			}
		}

		length = selectedElements.length;
		for(i = 0; i < length; i++) {
			var object = selectedElements[i];
			object.fn.call(object.elem, event);
		}
	};

	function _xmlHttpRequest() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch(e) {
			try {
				xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch(E) {
				xmlhttp = false;
			}
		}
		if(!xmlhttp && typeof XMLHttpRequest != 'undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	};

	function _handleAjaxResponse(type) {
		var response = this.responseText;
		if(!response) {
			return;
		}

		// Define type as 'text' by default
		type = type ? type : 'text';

		if(type == 'text') {
			return response;
		}
		if(type == 'script') {
			f.evalScript(response);
			return response;
		}
		if(type == 'xml') {
			if(!this.responseXML) {
				this.responseXML = f.parseXML(response);
			}
			return this.responseXML;
		}
		if(type == 'json') {
			return f.parseJSON(response);
		}
	};

	// Handler DOMContentLoaded event
	// Run all callbacks from _domReadyCallbacks array
	if(document.addEventListener) {
		document.addEventListener('DOMContentLoaded', _triggerReadyCallback, false);
		window.addEventListener('load', _triggerReadyCallback, false);
	}

	// Current version of FastJs
	f.version = '1.0';

	// Set browser info to browser property
	f.browser = _detectBrowser();

	//------------- Public methods -------------

	// Check element for some dom element properties
	// Anyway it could be object with the same properties
	f.isDOM = function(element) {
		return element && element.nodeType && element.nodeName;
	};

	// Allows you extend FastJs with your own methods
	f.extend = function(key, value) {
		if(key && value) {
			f[key] = value;
		}
	};

	// Handler get two arguments - object key and value
	// "this" in handler references to value
	f.each = function(object, handler) {
		var length = object.length,
		i = 0;

		// Check length for undefined
		// if object is an empty array, then length is a 0
		if(length !== undefined) {
			for(; i < length; i++) {
				if(handler.call(object[i], i, object[i]) === false) {
					break;
				}
			}
		}
		else {
			for(i in object) {
				if(handler.call(object[i], i, object[i]) === false) {
					break;
				}
			}
		}
		return object;
	};

	// Define isArray, isFunction ... methods
	// Wrap with function not to clog the framework scope
	(function() {
		var length = _objectTypes.length,
		i = 0;

		for(; i < length; i++) {
			f.extend('is' + _objectTypes[i], (function() {
				var type = _objectTypes[i];
				return function(obj) {
					return Object.prototype.toString.call(obj) === '[object ' + type + ']';
				}
			})());
		}

	})();

	//------------- DOM methods ----------------
	f.parents = function(element, selector) {
		selector = _getSelector(selector);
		var parents = [],
		length = element.length,
		i = 0;

		for(; i < length; i++) {
			parents = parents.concat(_getParents(element[i], selector));
		}
		return parents;
	};

	f.closest = function(element, selector) {
		selector = _getSelector(selector);
		// Return if selector '', 0, null or undefined
		if(!selector) {
			return [];
		}

		var length = element.length,
		closest = [],
		i = 0;

		for(; i < length; i++) {
			closest = closest.concat(_getParents(element[i], selector, true));
		}
		return closest;
	};

	f.children = function(element, selector) {
		selector = _getSelector(selector);
		var children = [],
		length = element.length,
		i = 0;

		for(; i < length; i++) {
			children = children.concat(_getChildren(element[i], selector));
		}
		return children;
	};

	f.siblings = function(element, selector) {
		selector = _getSelector(selector);
		var siblings = [],
		length = element.length,
		i = 0;

		for(; i < length; i++) {
			var elem = element[i],
			children = _getChildren(elem.parentNode, selector),
			len = children.length,
			c = 0;

			for(; c < len; c++) {
				// Cut the element from the list
				if(children[c] === elem) {
					children.splice(c, 1);
				}
			}
			siblings = siblings.concat(children);
		}
		return siblings;
	};

	f.attr = function(element, name, value) {
		name = f.trim(name);
		if(!name) {
			return [];
		}

		if(value) {
			element[0].setAttribute(name, value);
			return element;
		}
		else {
			return element[0].getAttribute(name);
		}
	};

	f.wrap = function(element, wrapper) {
		if(!wrapper) {
			return element;
		}

		var length = element.length,
		i = 0;

		for(; i < length; i++) {
			var elem = element[i],
			wrapElement = f.isString(wrapper) ? document.createElement(wrapper) : wrapper.cloneNode(true);
			elem.parentNode.insertBefore(wrapElement, elem);
			wrapElement.appendChild(elem);
		}
		return element;
	};

	f.unwrap = function(element) {
		var length = element.length,
		i = 0;

		for(; i < length; i++) {
			var parent = element[i].parentNode;
			if(parent.tagName !== 'BODY') {
				var children = parent.childNodes,
				len = children.length,
				c = 0;

				for(; c < len; c++) {
					parent.parentNode.insertBefore(children[0], parent);
				}
				parent.parentNode.removeChild(parent);
			}
		}
		return element;
	};

	f.append = function(element, children) {
		var length = element.length,
		i = 0;

		for(; i < length; i++) {
			// Clone children until the last iteration
			var child = i !== length - 1 ? f.clone(children) : children,
			elem = element[i],

			// Make sure this is array
			// Get error when child is a text node, because it has length property
			len = f.isArray(child) && child.length,
			c = 0;

			if(len) {
				for(; c < len; c++) {
					elem.appendChild(child[c]);
				}
			}
			else {
				elem.appendChild(child);
			}
		}
		return element;
	};

	f.insertAfter = function(element, after) {
		var length = after.length,
		i = 0;

		for(; i < length; i++) {
			var elem = i !== length - 1 ? f.clone(element) : element,
			len = f.isArray(elem) && elem.length,
			afterElem = after[i],
			parent = afterElem.parentNode,
			c = 0;

			if(len) {
				for(; c < len; c++) {
					if(afterElem.nextSibling) {
						parent.insertBefore(elem[c], afterElem.nextSibling);
					}
					else {
						parent.appendChild(elem[c]);
					}
				}
			}
			else {
				if(afterElem.nextSibling) {
					parent.insertBefore(elem, afterElem.nextSibling);
				}
				else {
					parent.appendChild(elem);
				}
			}
		}
		return element;
	};

	f.insertBefore = function(element, before) {
		var length = before.length,
		i = 0;

		for(; i < length; i++) {
			var elem = i !== length - 1 ? f.clone(element) : element,
			len = f.isArray(elem) && elem.length,
			beforeElem = before[i],
			c = 0;

			if(len) {
				for(; c < len; c++) {
					beforeElem.parentNode.insertBefore(elem[c], beforeElem);
				}
			}
			else {
				beforeElem.parentNode.insertBefore(elem[c], beforeElem);
			}
		}
		return element;
	};

	f.remove = function(element) {
		var length = element.length,
		i = 0;

		for(; i < length; i++) {
			var removed = element[i];
			if(removed.parentNode) {
				_removeData(removed.getElementsByTagName('*'));
				removed.parentNode.removeChild(removed);
			}
		}
		return element;
	};

	f.clone = function(element) {
		var collection = [],

		// Make sure this is array with dom elements
		length = f.isArray(element) && element.length,
		i = 0;

		if(length) {
			for(; i < length; i++) {
				collection[collection.length] = element[i].cloneNode(true);
			}
		}
		else {
			return element.cloneNode(true);
		}
		return collection;
	};

	f.find = function(element, selector) {
		selector = _getSelector(selector);
		var result = [],
		length = element.length,
		i = 0;

		for(; i < length; i++) {
			result = result.concat(_find(element[i], selector));
		}
		return result;
	};

	f.html = function(element, html) {
		var length = element.length,
		i = 0;

		for(; i < length; i++) {
			var elem = element[i];
			// Remove element nodes properties to prevent memory leak
			_removeData(elem.getElementsByTagName('*'));
			elem.innerHTML = html;
		}
	};

	f.text = function(element, text) {
		var length = element.length,
		i = 0;

		for(; i < length; i++) {
			var elem = element[i];
			elem.innerHTML = '';
			elem.appendChild(document.createTextNode(text));
		}
		return element;
	};

	f.offset = function(element) {
		var box = element[0].getBoundingClientRect(),

		body = document.body,
		docElem = document.documentElement,

		scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
		scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,

		clientTop = docElem.clientTop || body.clientTop || 0,
		clientLeft = docElem.clientLeft || body.clientLeft || 0;
		return {
			left: box.left + scrollLeft - clientLeft,
			top: box.top + scrollTop - clientTop
		};
	};

	f.addClass = function(element, names) {
		var length = element.length,
		names = names.split(/\s/),
		len = names.length,
		i = 0,
		c = 0;

		for(; i < length; i++) {
			var elem = element[i],
			elemClass = elem.className + ' ';

			for(; c < len; c++) {
				var name = names[c],
				regExp = new RegExp('(^| )' + name + '( | $)');
				if(!regExp.test(elemClass)) {
					elemClass += name + ' ';
				}
			}
			elem.className = f.trim(elemClass);
		}
		return element;
	};

	f.removeClass = function(element, names) {
		var length = element.length,
		names = names.split(/\s/),
		len = names.length,
		i = 0,
		c = 0;

		for(; i < length; i++) {
			var elem = element[i],
			elemClass = elem.className;

			for(; c < len; c++) {
				var regExp = new RegExp('(^| )' + names[c] + '( |$)');
				elemClass = elemClass.replace(regExp, ' ');
			}
			elem.className = elemClass;
		}
		return element;
	};

	f.hasClass = function(element, name) {
		return (new RegExp('(^| )' + name + '( |$)')).test(element[0].className);
	};

	f.toggleClass = function(element, name) {
		var length = element.length,
		regexp = new RegExp('(^| )' + name + '( |$)'),
		i = 0;

		for(; i < length; i++) {
			var elem = element[i],
			elemClass = elem.className;
			if(regexp.test(elemClass)) {
				elem.className = f.trim(elemClass.replace(regexp, ' '));
			}
			else {
				elem.className += ' ' + name;
			}
		}
		return element;
	};

	f.css = function(element, style, value) {
		var length = element.length,
		i = 0;

		if(style.indexOf('-') !== -1) {
			style = style.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/, function(str, match) {
				return (match + '').toUpperCase();
			});
		}

		if(style === 'float') {
			style = f.browser.msie ? 'styleFloat' : 'cssFloat';
		}

		if(value) {
			for(; i < length; i++) {
				if(style === 'opacity' && f.browser.msie && f.browser.version < 9) {
					var filter = element[i].style.filter;
					if(filter.toLowerCase().indexOf('opacity') !== -1) {
						filter = filter.replace(/opacity=(\d+)/, 'opacity=' + value * 100);
					}
					else {
						filter += 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + value * 100 + ')';
					}
					element[i].style.filter = filter;
				}
				else {
					element[i].style[style] = value;
				}
			}
		}
		else {
			var elem = element[0];
			if(window.getComputedStyle) {
				return window.getComputedStyle(elem, null)[style];
			}
			else if(elem.currentStyle) {
				if(style === 'opacity') {
					var filter = elem.currentStyle && elem.currentStyle.filter || elem.style.filter || '',
					opacity = filter.toLowerCase().match(/opacity=(\d+)/);
					return (opacity && opacity[1] / 100) || 1;
				}
				return elem.currentStyle[style];
			}
			else {
				return elem.style[style];
			}
		}
		return element;
	};

	f.val = function(element) {
		// Return value of the first element
		var elem = element[0],
		tag = elem.tagName.toLowerCase();

		if(tag === 'input') {
			return elem.value ? elem.value : '';
		}

		if(tag === 'select') {
			var values = [],
			options = elem.options,
			single = elem.type == 'select-one',
			index = options.selectedIndex,

			// Minimize cycle iterations if select is not multiple
			length = single ? index + 1 : options.length,
			i = single ? index : 0;

			// Index -1 none options was selected
			if(index < 0) {
				return null;
			}

			for(; i < length; i++) {
				var option = options[i],
				parent = option.parentNode;

				// Do not select disabled options and options in disabled optgroup
				if(option.selected && !option.disabled && (parent && parent.tagName == 'OPTGROUP' && !parent.disabled)) {

					// Return value if select is not multiple
					if(single) {
						return option.value;
					}

					// Return an array if select is multiple
					values[values.length] = option.value;
				}
			}
			return values;
		}

		if(tag === 'textarea') {
			// textContent works much faster then innerHTML
			return elem.textContent;
		}
	},

	f.serialize = function(element) {
		var formElements = _find(element[0], 'input, select, textarea'),
		length = formElements.length,
		params = [],
		i = 0;

		for(; i < length; i++) {
			var elem = formElements[i];

			// Don't handle element without name
			if(elem.name) {
				var val = f.val(elem);

				if(f.isArray(val)) {
					var c = 0,
					len = val.length;
					for(; c < len; c++) {
						params[params.length] = encodeURIComponent(elem.name) + '=' + encodeURIComponent(val[c]);
					}
				}
				else {
					params[params.length] = encodeURIComponent(elem.name) + '=' + encodeURIComponent(val);
				}
			}
		}

		return params.join('&').replace(/%20/g, '+');
	};

	f.serializeObject = function(element) {

	};

	//------------- Events -----------------
	f.on = function(element, selector, type, handler) {
		if(!handler) {
			handler = type;
			type = selector;
			selector = undefined;
		}

		var length = element.length,
		i = 0;
		for(; i < length; i++) {
			_attachEvent(element[i], selector, type, handler);
		}
		return element;
	};

	f.off = function(element, selector, type, handler) {
		if(f.isFunction(type) || type === undefined) {
			handler = type;
			type = selector;
			selector = undefined;
		}

		if(!element || !type) {
			return;
		}

		var length = element.length,
		i = 0;
		for(; i < length; i++) {
			_removeEvent(element[i], selector, type, handler);
		}
		return element;
	};

	//----------- Ajax -------------
	f.isJSON = function(json) {
		if(!f.trim(json)) {
			return false;
		}

		json = json
			.replace(/\\["\\\/bfnrtu]/g, '@')
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

		return (/^[\],:{}\s]*$/.test(json));
	};

	f.parseJSON = function(json) {
		json = f.trim(json);

		if(!json || typeof json !== 'string') {
			return null;
		}

		// If browser support use native json parse method
		if(window.JSON && window.JSON.parse) {
			return window.JSON.parse(json);
		}

		if(f.isJSON(json)) {
			return (new Function( 'return ' + json ))();
		}
	};

	f.parseXML = function(data) {
		var xml, tmp;
		if (!data || typeof data !== 'string') {
			return null;
		}

		try {
			if(window.DOMParser) {
				tmp = new DOMParser();
				xml = tmp.parseFromString(data , 'text/xml');
			}
			else {
				xml = new ActiveXObject('Microsoft.XMLDOM');
				xml.async = false;
				xml.loadXML(data);
			}
		}
		catch(e) {
			xml = undefined;
		}

		if(!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
			f.error('Invalid XML: ' + data);
		}
		return xml;
	};

	f.evalScript = function(script) {
		if(script && /\S/.test(script)) {
			(window.execScript || (function(script) {
				window.eval.call(window, script);
			}))(script);
		}
	};

	f.ajax = function(type, url, data, callback, dataType, settings) {
		// Shift arguments if data argument was omitted
		if(f.isFunction(data)) {
			dataType = dataType || callback;
			callback = data;
			data = null;
		}

		// Make settings an object
		settings = f.isObject(settings) ? f.merge(f.ajaxSettings, settings) : f.ajaxSettings;

		// Make type upper case
		type = type.toUpperCase();

		// Encode params
		if(f.isObject(data)) {
			var params = '';
			for(var key in data) {
				params += encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
			}
			data = params;
		}

		if(type == 'GET' && data) {
			url += (url.indexOf('?') !== -1 ? '&' : '?') + data;
			data = null;
		}

		var request = _xmlHttpRequest();
		request.open(type, url, settings.async ? settings.async : f.ajaxSettings.async);
		request.setRequestHeader('Content-Type', settings.contentType ? settings.contentType : f.ajaxSettings.contentType);

		request.onreadystatechange = function() {
			if(request.readyState == 4 && request.status == 200) {
				var response = _handleAjaxResponse.call(request, dataType);
				callback(response);
			}
		};

		request.send(data);
		return request;
	};

	// Ajax global settings
	f.ajaxSettings = {
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		async: true
	};

	//----------- Effects ------------
	f.fadeIn = function(element, speed, callback) {

	};

	f.fadeOut = function(element, speed, callback) {

	};

	f.slideUp = function(element, speed, callback) {

	};

	f.slideDown = function(element, speed, callback) {

	};

	// Objects duplicate keys wil be replaced with the last
	// Arrays just concats
	f.merge = function() {
		var target = arguments[0],
		length = arguments.length,
		c = 1;

		for(; c < length; c++) {
			var element = arguments[c];
			if(target.length !== undefined) {
				var len = element.length,
				i = 0;
				for(; i < len; i++) {
					target[target.length] = element[i];
				}
			}
			else {
				for(var i in element) {
					target[i] = element[i];
				}
			}
		}
		return target;
	};

	f.trim = function(string) {
		if(!string) {
			return '';
		}

		// If available use native trim method
		if(typeof _trim === 'function') {
			return _trim.call(string);
		}
		return string.toString().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};

	f.error = function(msg) {
		throw new Error(msg);
	};

	// Define global f property
	window.f = f;
})(window, undefined);