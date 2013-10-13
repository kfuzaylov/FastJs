/*
 * FastJs v1.0
 * http://fastjs.net
 *
 * Author: Kadir A. Fuzaylov
 */
(function(window, undefined) {
	'use strict';

	// Quick references to window properties
	var document = window.document,

		userAgent = window.navigator.userAgent,

	// Flag not to run dom ready callbacks twice
		_domReady = false,

	// Callbacks to trigger on DOMContentLoaded event
		_domReadyCallbacks = [],

	// Regular expression to match selectors
		_isClass = /^\.[-\w]+$/i,
		_isId = /^#[-\w]+$/i,
		_isTag = /^[a-z0-9]+$/i,

	// Object types to create type check methods
		_objectTypes = ['Object', 'Function', 'String', 'Number'],

	// Idetifier for each event handler
		_handlerId = 0,

	//Shortcut for prototype methods
		_arr = [],
		_slice = _arr.slice,
		_isArray = Array.isArray,

	// Local ajax settings
	// This settings will overwritten by globals
		_ajaxSettings = {
			url: '',
			data: null,
			async: true,
			type: 'GET',
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
		};

	//------------- Privet methods -----------------
	// Main FastJs f method
	function f(selector) {
		// If selector '', 0, null or undefined
		if(!selector) {
			return null;
		}

		if(typeof selector === 'string') {
			return _find(document, selector);
		}
		else if(typeof selector === 'function') {
			_domReadyCallbacks.push(selector);
		}
		else if(selector === document || selector === window) {
			return [selector];
		}
		else if(selector.nodeType && selector.nodeName) {
			return [selector];
		}
	};

	function _triggerReadyCallback(event) {
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
		if(userAgent.indexOf('MSIE') !== -1) {
			browser = {
				msie: true,
				version: userAgent.match(/MSIE ([0-9\.]+);/)[1]
			}
		}
		else if(userAgent.indexOf('Firefox') !== -1) {
			browser = {
				firefox: true,
				version: userAgent.match(/Firefox\/([0-9\.]+)/)[1]
			}
		}
		else if(userAgent.indexOf('Opera') !== -1) {
			browser = {
				opera: true,
				version: userAgent.match(/Version\/([0-9\.]+)/)[1]
			}
		}
		else if(userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Safari') !== -1) {
			browser = {
				chrome: true,
				version: userAgent.match(/Chrome\/([0-9\.]+)/)[1]
			}
		}
		else if(userAgent.indexOf('Chrome') === -1 && userAgent.indexOf('Safari') !== -1) {
			browser = {
				safari: true,
				version: userAgent.match(/Version\/([0-9\.]+)/)[1]
			}
		}

		return browser;
	};

	function _document(data) {
		var doc = document.implementation.createHTMLDocument('New document');
		doc.body.innerHTML = data;
		return doc;
	};

	function _returnTrue() {
		return true;
	};

	function _returnFalse() {
		return false;
	};

	// Method gets all parents or by selector
	// If closest is true return the first parent by selector
	function _getParents(element, selector, closest) {
		var parents = [];

		while(element.parentNode && element.parentNode.nodeType === 1) {
			var parentNode = element.parentNode,
				length = parents.length;

			if(selector) {
				if(_isId.test(selector) && parentNode.id === selector.substr(1)) {
					parents[length] = parentNode;
				}
				else if(_isClass.test(selector) && (' ' + parentNode.className + ' ').indexOf(' ' + selector.substr(1) + ' ') !== -1) {
					parents[length] = parentNode;
				}
				else if(_isTag.test(selector) && parentNode.tagName === selector.toUpperCase()) {
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
		var allChildren = element.childNodes,
			length = allChildren.length,
			children = [],
			i = 0;

		for(; i < length; i++) {
			var item = allChildren[i];

			if(allChildren[i].nodeType === 1) {
				if(selector) {
					if(_isId.test(selector) && item.id === selector.substr(1)) {
						children.push(item);
					}
					else if(_isClass.test(selector) && (' ' + item.className + ' ').indexOf(' ' + selector.substr(1) + ' ') !== -1) {
						children.push(item);
					}
					else if(_isTag.test(selector) && item.tagName === selector.toUpperCase()) {
						children.push(item);
					}
					else if(item === element.querySelector(selector)) {
						children.push(item);
					}
				}
				else {
					children.push(item);
				}
			}
		}
		return children;
	};

	function _find(element, selector) {
		if(selector) {
			if(_isId.test(selector)) {
				// If element is document use getElementById
				// This is the fastest way to get element by id
				if(element === document) {
					var elem = document.getElementById(selector.substr(1));
					return elem ? [elem] : [];
				}
				else {
					return _slice.call(element.querySelectorAll(selector));
				}
			}
			if(_isClass.test(selector)) {
				return _slice.call(element.getElementsByClassName(selector.substr(1)));
			}
			else if(_isTag.test(selector)) {
				return _slice.call(element.getElementsByTagName(selector));
			}
			else {
				return _slice.call(element.querySelectorAll(selector));
			}
		}
		return [];
	};

	// Remove element properties before remove or replace them
	// ot prevent memory leak
	function _removeData(element) {
		var length = element.length,
			i = 0

		for(; i < length; i++) {
			var elem = element[i];

			if(elem.events) {
				delete elem.events;
			}

			if(elem.liveHandler) {
				delete elem.liveHandler;
			}

			if(elem.handler) {
				delete elem.handler;
			}
		}
	};

	//------------ Events -------------
	function _attachEvent(element, type, selector, handler) {
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
		}

		if(!selector && !element.handle) {
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
			if(event.stop) {
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
		event.preventDefault = event.prevetDefault || function() {
			this.returnValue = false;
		};
		event.stopPropagation = event.stopPropagation || function() {
			this.cancelBubble = true
		};

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

	function _removeEvent(element, type, selector, handler) {
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
				if(handler) {
					if(handler === handlers[id] && selector === handlers[id].selector) {
						delete handlers[id];
					}
				}
				else {
					if(selector === handlers[id].selector) {
						delete handlers[id];
					}
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
			if(!handler && !selector) {
				element.removeEventListener(type, element.liveHandler, false);
				element.removeEventListener(type, element.handle, false);
			}
			else {
				element.removeEventListener(type, (selector ? element.liveHandler : element.handle), false);
			}
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

		delete element.handle;
		delete element.events;
		delete element.liveHandler;
	};

	function _liveEvent(event) {
		event = _adjustEvent(event);
		var handlers = this.events.live[event.type],
			selectedElements = [],
			i;

		for(i in handlers) {
			var handler = handlers[i],
				elements = _find(this, handler.selector),
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

	function _handleAjaxResponse(type) {
		var response = this.responseText;
		if(!response) {
			return;
		}

		// Define type as 'text' by default
		type = type ? type : 'text';

		if(type == 'text') {
			return response || '';
		}

		if(type == 'document') {
			type = response.toLowerCase().indexOf('<?xml') !== -1 ? 'application/xml' : 'text/html';
			return f.domParser(response, type);
		}

		if(type == 'json') {
			return window.JSON.parse(response);
		}
	};

	// Handler DOMContentLoaded event
	// Run all callbacks from _domReadyCallbacks array
	document.addEventListener('DOMContentLoaded', _triggerReadyCallback, false);
	window.addEventListener('load', _triggerReadyCallback, false);

	// Current version of FastJs
	f.version = '1.0';

	// Set browser info to browser property
	f.browser = _detectBrowser();

	//------------- Public methods -------------

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

	// Define isFunction, isObject and etc methods
	// Wrap with function not to clog the main scope
	(function() {
		var length = _objectTypes.length, i = 0;

		for(; i < length; i++) {
			f.extend('is' + _objectTypes[i], (function() {
				var type = _objectTypes[i];
				return function(obj) {
					// Use Object.prototype.toString method, because
					// typeof doesn't fit for these object
					if(type === 'Object' || type === 'HTMLCollection') {
						return Object.prototype.toString.call(obj) === '[object ' + type + ']';
					}
					else {
						// Otherwise use typeof, because it is faster
						return typeof obj === type.toLowerCase();
					}
				}
			})());
		}
	})();

	//------------- DOM methods ----------------
	// Check element for some dom element properties
	// Anyway it could be object with the same properties
	f.isDOM = function(element) {
		element = element[0];
		return !!(element && element.nodeType && element.nodeName);
	};

	f.parents = function(element, selector) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			parents = [],
			i = 0;

		for(; i < length; i++) {
			parents = parents.concat(_getParents(element[i], selector));
		}
		return parents;
	};

	f.parent = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			parents = [],
			parent,
			i = 0;

		for(; i < length; i++) {
			parent = element[i].parentNode;
			if(parent && parent.nodeType === 1) {
				parents.push(element[i].parentNode);
			}
		}
		return parents;
	};

	f.closest = function(element, selector) {
		if(!selector) {
			return [];
		}

		if(typeof element === 'string') {
			element = f(element);
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
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			children = [],
			i = 0;

		for(; i < length; i++) {
			children = children.concat(_getChildren(element[i], selector));
		}
		return children;
	};

	f.siblings = function(element, selector) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			siblings = [],
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
		if(typeof element === 'string') {
			element = f(element);
		}

		name = name.trim();

		if(value) {
			var length = element.length,
				i = 0;

			for(; i < length; i++) {
				element[i].setAttribute(name, value);
			}
			return element;
		}
		else {
			return element[0].getAttribute(name);
		}
	};

	f.removeAttr = function(element, name) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			i = 0;
		for(; i < length; i++) {
			element[i].removeAttribute(name);
		}
		return element;
	};

	f.wrap = function(element, wrapper) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var origins = [],
		length = element.length,
			i = 0;

		for(; i < length; i++) {
			var elem = element[i],
				wrapElement = f.isString(wrapper) ? document.createElement(wrapper) : wrapper.cloneNode(true);

			elem.parentNode.insertBefore(wrapElement, elem);
			wrapElement.appendChild(elem);
			origins.push(elem);
		}
		return origins;
	};

	f.unwrap = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			i = 0;

		for(; i < length; i++) {
			var parent = element[i].parentNode;
			if(parent && parent.tagName && parent.tagName.toLowerCase() !== 'body') {
				var children = parent.childNodes,
					len = children.length,
					ancestor = parent.parentNode,
					c = 0;

				for(; c < len; c++) {
					if(ancestor) {
						ancestor.insertBefore(children[0], parent);
					}
				}
				parent.parentNode.removeChild(parent);
			}
		}
		return element;
	};

	f.append = function(element, children) {
		if(typeof element === 'string') {
			element = f(element);
		}

		if(typeof children === 'string') {
			children = f.create(children);
		}

		var length = element.length,
			i = 0;

		for(; i < length; i++) {
			// Clone children until the last iteration
			var child = i !== (length - 1) ? f.clone(children) : children,
				elem = element[i],

				// Make sure this is array
				// Get error when child is a text node, because it has length property
				len = _isArray(child) && child.length,
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

	f.insertAfter = function(element, target) {
		if(typeof element === 'string') {
			element = f.create(element);
		}

		if(typeof target === 'string') {
			target = f(target);
		}

		var length = target.length,
			i = 0;

		for(; i < length; i++) {
			var elem = i !== length - 1 ? f.clone(element) : element,
				len = elem.length,
				afterElem = target[i],
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

	f.insertBefore = function(element, target) {
		if(typeof element === 'string') {
			element = f.create(element);
		}

		if(typeof target === 'string') {
			target = f(target);
		}

		var length = target.length,
			i = 0;

		for(; i < length; i++) {
			var elem = i !== length - 1 ? f.clone(element) : element,
				len = elem.length,
				beforeElem = target[i],
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
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			removedCollection = [],
			i = 0;

		for(; i < length; i++) {
			var removed = element[i];
			if(removed.parentNode) {
				_removeData(removed.getElementsByTagName('*'));
				removed.parentNode.removeChild(removed);
				removedCollection.push(removed);
			}
		}
		return removedCollection;
	};

	f.clone = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var collection = [],
		length = element.length,
		i = 0;

		for(; i < length; i++) {
			collection.push(element[i].cloneNode(true));
		}
		return collection;
	};

	f.find = function(element, selector) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var collection = [],
			result,
			length = element.length,
			i = 0;

		for(; i < length; i++) {
			result = _find(element[i], selector);
			collection = collection.concat(result);
		}
		return collection;
	};

	f.create = function(html) {
		var fragment = document.createDocumentFragment(),
		tempNode = document.createElement('div');
		tempNode.innerHTML = html;

		var children = tempNode.childNodes,
		length = children.length,
		i = 0;

		for(; i < length; i++) {
			fragment.appendChild(children[0]);
		}
		return _slice.call(fragment.childNodes);
	};

	f.html = function(element, html) {
		if(html) {
			if(typeof element === 'string') {
				element = f(element);
			}

			var length = element.length,
			i = 0;

			for(; i < length; i++) {
				var elem = element[i];
				// Remove element nodes properties to prevent memory leak
				_removeData(elem.getElementsByTagName('*'));
				elem.innerHTML = html;
			}
			return element;
		}
		return element[0].innerHTML;
	};

	f.contents = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			result = [],
			i = 0;

		for(; i < length; i++) {
			if(element[i].tagName.toLowerCase() === 'iframe') {
				result.push(element[i].contentDocument || element[i].contentWindow.document);
			}
			else {
				result = result.concat(_slice.call(element[i].childNodes));
			}
		}
		return result;
	};

	f.contains = function(context, element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		if(typeof context === 'string') {
			context = f(context);
		}

		context = context[0];
		element = element[0];

		if(element) {
			while(element = element.parentNode) {
				if(element === context) {
					return true;
				}
			}
		}
		return false;
	};

	f.text = function(element, text) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
		result = '',
		hasText = text !== undefined,
		i = 0;

		for(; i < length; i++) {
			var elem = element[i];

			if(hasText) {
				// Remove element nodes properties to prevent memory leak
				_removeData(elem.getElementsByTagName('*'));
				elem.innerHTML = '';
				elem.appendChild(document.createTextNode(text));
			}
			else {
				var nodeType = elem.nodeType;
				if((nodeType === 1 || nodeType === 9 || nodeType === 11) && typeof elem.textContent === 'string') {
					result += ' ' + elem.textContent;
				}
				else if(nodeType === 3 || nodeType === 4) {
					result += ' ' + elem.nodeValue;
				}
			}
		}
		return hasText ? element : result;
	};

	f.offset = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		// Make sure this is not a disconnected DOM node
		if(!f.contains([document.documentElement], element)) {
			return {left: 0, top: 0};
		}

		var box = element[0].getBoundingClientRect(),
		docElem = document.documentElement;

		return {
			left: box.left + window.pageXOffset - docElem.clientLeft,
			top: box.top + window.pageYOffset - docElem.clientTop
		};
	};

	f.addClass = function(element, names) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			names = names.split(/\s/),
			len = names.length,
			i = 0, c = 0, name, elem, elemClass;

		for(; i < length; i++) {
			elem = element[i];
			elemClass = ' ' + elem.className + ' ';

			for(; c < len; c++) {
				name = names[c];
				if(elemClass.indexOf(' ' + name + ' ') < 0) {
					elemClass += name + ' ';
				}
			}
			elem.className = elemClass.trim();
		}
		return element;
	};

	f.removeClass = function(element, names) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			names = names ? names.split(/\s/) : [],
			len = names.length,
			i = 0;

		for(; i < length; i++) {
			var elem = element[i],
				elemClass = elem.className || '',
				c = 0;

			for(; c < len; c++) {
				var regExp = new RegExp('(^| )' + names[c] + '( |$)');
				elemClass = elemClass.replace(regExp, ' ');
			}

			if(elem.className == elemClass) {
				elemClass = '';
			}

			elem.className = elemClass.trim();
		}
		return element;
	};

	f.hasClass = function(element, name) {
		if(typeof element === 'string') {
			element = f(element);
		}

		return (' ' + (element[0] || element).className + ' ').indexOf(' ' + name + ' ') > -1;
	};

	f.toggleClass = function(element, name) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			i = 0;

		for(; i < length; i++) {
			var elem = element[i],
				elemClass = ' ' + elem.className + ' ';
			name = ' ' + name + ' ';

			if(elemClass.indexOf(name) > -1) {
				elem.className = elemClass.replace(name, ' ').trim();
			}
			else {
				elem.className = (elem.className + ' ' + name).trim();
			}
		}
		return element;
	};

	f.css = function(element, style, value) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			i = 0;

		if(style.indexOf('-') !== -1) {
			style = style.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/, function(str, match) {
				return (match + '').toUpperCase();
			});
		}

		if(style === 'float') {
			style = 'cssFloat';
		}

		if(value !== undefined) {
			for(; i < length; i++) {
				element[i].style[style] = value;
			}
		}
		else {
			var elem = element[0];
			if(typeof elem.style[style] !== 'undefined' && elem.style[style]) {
				return elem.style[style];
			}
			//window.getComputedStyle return "" result for disconnected elements
			//use it only for real dom elements
			else if(window.getComputedStyle) {
				return window.getComputedStyle(elem, null)[style];
			}
		}
		return element;
	};

	f.val = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		// Return value of the first element
		var elem = _isArray(element) && element[0] || element,
			tag = elem.tagName.toLowerCase();

		if(tag === 'input' || tag === 'textarea') {
			return elem.value;
		}

		if(tag === 'select') {
			var values = [],
				options = elem.options,
				single = elem.type == 'select-one',
				index = options.selectedIndex,

			// Minimize cycle iterations if select is not multiple
				length = single ? index + 1 : options.length, i = single ? index : 0;

			// Index -1 none options were selected
			if(index < 0) {
				return null;
			}

			for(; i < length; i++) {
				var option = options[i],
					parent = option.parentNode;

				// Do not handle disabled options and options in disabled optgroup
				if(option.selected && !option.disabled && (parent && (!parent.disabled || !parent.tagName.toLowerCase() === 'optgroup'))) {

					// Return value if select is not multiple
					if(single) {
						return option.value;
					}

					// Return an array if select is multiple
					values.push(option.value);
				}
			}
			return values;
		}
	},

	f.serialize = function(element) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var inputs = _find(element[0], 'input, select, textarea'),
			length = inputs.length,
			params = [], i = 0;

		for(; i < length; i++) {
			var elem = inputs[i];

			// Handle only enabled elements with name
			if(elem.name && !elem.disabled) {

				// Don't handle unchecked radio/checkbox inputs
				if(elem.tagName.toLowerCase() === 'input' && (elem.type === 'radio' || elem.type === 'checkbox') && !elem.checked) {
					continue;
				}

				var val = f.val(elem);

				if(_isArray(val)) {
					var c = 0,
						len = val.length;

					for(; c < len; c++) {
						params.push(encodeURIComponent(elem.name) + '=' + encodeURIComponent(val[c]));
					}
				}
				else {
					params.push(encodeURIComponent(elem.name) + '=' + encodeURIComponent(val));
				}
			}
		}
		return params.join('&').replace(/%20/g, '+');
	};

	//------------- Events -----------------
	f.on = function(element, type, selector, handler) {
		if(typeof element === 'string') {
			element = f(element);
		}

		// Use selector for live event handler
		if(!handler) {
			handler = selector;
			selector = undefined;
		}

		var length = element.length, i = 0;
		for(; i < length; i++) {
			_attachEvent(element[i], type, selector, handler);
		}
		return element;
	};

	f.off = function(element, type, selector, handler) {
		if(typeof element === 'string') {
			element = f(element);
		}

		if(f.isFunction(selector) || selector === undefined) {
			handler = selector;
			selector = undefined;
		}

		if(!element || !type) {
			return;
		}

		var length = element.length,
			i = 0;
		for(; i < length; i++) {
			_removeEvent(element[i], type, selector, handler);
		}
		return element;
	};

	f.trigger = function(element, event) {
		if(typeof element === 'string') {
			element = f(element);
		}

		var length = element.length,
			elem, i = 0;

		for(; i < length; i++) {
			elem = element[i];
			// Trigger events only for element nodes
			if(elem.nodeType === 1 && event) {
				event = f.event(event, {target: elem});
				if(elem.handle) {
					elem.handle.call(elem, event);
				}

				// Check if parent node delegated events handler
				while(elem = elem.parentNode) {
					var events = elem.events;
					if(!events) {
						continue;
					}
					if(events.live && events.live[event.type]) {
						for(var id in events.live[event.type]) {
							if(f(events.live[event.type][id].selector)[0] === element[0]) {
								elem.liveHandler.call(elem, event);
							}
						}
					}
					if(events[event.type]) {
						elem.handle.call(elem, event);
					}
				}
			}
		}
		return element;
	};

	f.event = function(type, props) {
		// Check if type is event object
		if(type && type.type) {
			return type;
		}

		var event = new function() {
			this.type = type;
			this.timeStamp = +new Date();
			this.ctrlKey = false;
			this.altKey = false;
			this.metaKey = false;
			this.shiftKey = false;
			this.isDefaultPrevented = _returnFalse;
			this.isPropagationStopped = _returnFalse;
			this.isImmediatePropagationStopped = _returnFalse;
			this.preventDefault = function() {
				this.isDefaultPrevented = _returnTrue;
			},
				this.stopPropagation = function() {
					this.isPropagationStopped = _returnTrue;
				},
				this.stopImmediatePropagation = function() {
					this.isImmediatePropagationStopped = _returnTrue;
				}
		}

		// Extend object with passed properties
		if(props) {
			f.merge(event, props);
		}
		return event;
	};

	//----------- Ajax -------------
	f.isJSON = function(json) {
		if(!json.trim()) {
			return false;
		}

		json = json.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '');
		return (/^[\],:{}\s]*$/.test(json));
	};

	f.domParser = function(data, type) {
		// Supported types
		// text/html - HTML document
		// application/xml - XML document
		// image/svg+xml - SVG document
		try {
			var doc = (new DOMParser()).parseFromString(data, type);
			if(doc) {
				return doc;
			}
			else {
				return _document(data.replace(/<\/?body>/gi, ''));
			}
		}
		catch(ex) {
			return _document(data.replace(/<\/?body>/gi, ''));
		}

	};

	f.ajax = function(settings) {
		// Local copy of settings to prevent settings merge
		var localSettings = f.merge({}, _ajaxSettings);
		// Make settings an object
		settings = f.merge(localSettings, settings) || _ajaxSettings;

		// Make type upper case
		settings.type = settings.type.toUpperCase();

		// Set data object to send them as POST or GET params
		if(f.isObject(settings.data) && !settings.dataFile) {
			var params = '';
			for(var key in settings.data) {
				params += encodeURIComponent(key) + '=' + encodeURIComponent(settings.data[key]);
			}
			settings.data = params;
		}

		// Here data is additional GET params
		// Object could not be sent with GET method
		if(settings.type === 'GET' && settings.data) {
			settings.url += (settings.url.indexOf('?') !== -1 ? '&' : '?') + settings.data.replace(/%20/g, '+');
			settings.data = null;
		}

		var xhr = new XMLHttpRequest();
		xhr.open(settings.type, settings.url, settings.async);

		// Google Chrome and Internet Explorer don't support "json" response
		// Try catch doesn't help
		if(settings.responseType && settings.responseType === 'json' && (f.browser.msie || f.browser.chrome)) {
			settings.dataType = settings.responseType;
		}
		else {
			try {
				xhr.responseType = settings.responseType;
			}
			catch(e) {
				settings.dataType = settings.responseType;
			}
		}

		if(settings.contentType && !settings.dataFile) {
			xhr.setRequestHeader('Content-Type', settings.contentType);
		}

		if(settings.downProgress) {
			xhr.onprogress = function(e) {
				if(e.lengthComputable) {
					settings.downProgress.call(this, e.loaded, e.total);
				}
			};
		}

		if(settings.upProgress) {
			xhr.upload.onprogress = function(e) {
				if(e.lengthComputable) {
					settings.upProgress.call(this, e.loaded, e.total);
				}
			};
		}

		xhr.onload = function() {
			var status = this.status;
			if(status >= 200 && status < 300 || status === 304) {
				var response = (!this.response || settings.dataType) ? _handleAjaxResponse.call(this, settings.responseType || settings.dataType) : this.response;
				settings.success(response, this);
			}
			else {
				settings.error(this);
			}
		};

		xhr.send(settings.data);
		return xhr;
	};

	// Ajax global settings
	f.ajaxSettings = function(options) {
		f.merge(_ajaxSettings, options);
	};

	// Objects duplicate keys will be replaced with the last ones
	// Arrays just being concat
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
					target.push(element[i]);
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

	f.isArray = function(obj) {
		return _isArray(obj);
	};

	f.cookie = function(name, value, props, secure) {
		// Set or delete cookie
		if(typeof value !== 'undefined') {
			props = props || {};
			var exp = props.expires;

			if(typeof exp === 'number' && exp) {
				var date = new Date();
				date.setTime(date.getTime() + exp * 1000);
				exp = date;
			}

			if(exp && exp.toUTCString) {
				props.expires = exp.toUTCString();
			}

			var cookies = encodeURIComponent(name) + '=' + encodeURIComponent(value);
			for(var key in props) {
				cookies += '; ' + key + '=' + props[key];
			}

			cookies += secure ? '; secure' : '';
			document.cookie = cookies;
		}
		else {
			// Get cookie
			var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
			return matches ? decodeURIComponent(matches[1]) : undefined
		}
	};

	// Define global f property
	window.f = f;
})(window, undefined);
