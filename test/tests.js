module('Attributes');
test('f.attr(element, name, value)', function() {
	expect(11);
	var input = f.create('<input type="text" value="123">');
	equal(f.attr(input, 'value'), '123', 'Check value attribute');
	equal(f.attr(input, 'type'), 'text', 'Check type attribute');

	f.attr(input, 'maxlength', '43');
	equal(f.attr(input, 'maxlength'), '43', 'Check maxlength attribute');

	f.attr(input, 'id', 'newId');
	equal(f.attr(input, 'id'), 'newId', 'Check id attribute');

	f.attr(input, 'name', 'elem[]');
	equal(f.attr(input, 'name'), 'elem[]', 'Check name attribute');

	f.attr(input, 'onclick', 'func()');
	equal(f.attr(input, 'onclick'), 'func()', 'Check onclick attribute');

	var checkbox = f.create('<input type="checkbox">');
	f.attr(checkbox, 'checked', 'checked');
	ok(checkbox[0].checked, 'Check checked stage');

	f.attr(checkbox, 'color-value', '#ff0000');
	equal(f.attr(checkbox, 'color-value'), '#ff0000', 'Check custom attribute');
	strictEqual(f.attr(checkbox, 'height'), null, 'Check for undefined value');

	var form = f.create('<form action="index.php" method="get"></form>');
	equal(f.attr(form, 'action'), 'index.php', 'Check form action attribute');
	equal(f.attr(form, 'method'), 'get', 'Check form method attribute');
});

test('f.removeAttr(element, name)', function() {
	expect(4);
	var input = f.create('<input type="text" name="test">');
	f.removeAttr(input, 'name');
	equal(f.attr(input, 'name'), undefined, 'Check removed attribute name');

	f.attr(input, 'checked', 'checked');
	f.removeAttr(input, 'checked');
	equal(input[0].checked, false, 'Check checked false attribute');

	ok(f.removeAttr(input, 'unknownAttr'), 'Remove non existing attribute');

	f.attr(input, 'style', 'color: #ff0000');
	f.removeAttr(input, 'style');
	equal(f.attr(input, 'style'), undefined, 'Check removed style');

});

test('f.addClass(element, className)', function() {
	expect(6);
	var div = f(document.createElement('div'));

	f.addClass(div, 'test-class-name');
	equal(f.attr(div, 'class'), 'test-class-name', 'Make sure class name added properly');

	f.addClass(div, 'second');
	equal(f.attr(div, 'class'), 'test-class-name second', 'Make sure second class name added properly');

	f.addClass(div, 'second');
	equal(f.attr(div, 'class'), 'test-class-name second', 'Do not add the same class twice');

	f.addClass(div, 'one two');
	equal(f.attr(div, 'class'), 'test-class-name second one two', 'Make sure there is not too much trimming');

	f.addClass(div, 'sec');
	equal(f.attr(div, 'class'), 'test-class-name second one two sec', 'Adding a similar class does not get interrupted');

	f.addClass(div, 'three three');
	equal(f.attr(div, 'class'), 'test-class-name second one two sec three', 'Do not add the same class twice in the same call');
});

test('f.removeClass(element, className)', function() {
	expect(3);
	var div = f(document.createElement('div'));

	f.addClass(div, 'one two');
	f.removeClass(div, 'two');
	equal(f.attr(div, 'class'), 'one', 'Class removed properly');

	f.addClass(div, 'two three');
	f.removeClass(div, 'one three');
	equal(f.attr(div, 'class'), 'two', 'Several classes removed properly');

	f.removeClass(div);
	equal(f.attr(div, 'class'), '', 'Remove all classes and no extra spaces');
});

test('f.hasClass(element, name)', function() {
	expect(4);
	var div = f.create('<div></div>');
	f.addClass(div, 'first');
	strictEqual(f.hasClass(div, 'first'), true, 'Check single added class');

	f.addClass(div, 'second');
	strictEqual(f.hasClass(div, 'second'), true, 'Check class from several');

	strictEqual(f.hasClass(div, 'sec'), false, 'Check for similar class');

	f.removeClass(div, 'first');
	strictEqual(f.hasClass(div, 'first'), false, 'Check removed class');
});

test('f.toggleClass(element, className)', function() {
	expect(2);
	var div = f(document.createElement('div'));

	f.toggleClass(div, 'new');
	equal(f.attr(div, 'class'), 'new', 'Add when class does not exist');

	f.toggleClass(div, 'new');
	equal(f.attr(div, 'class'), '', 'Remove when class does not exist');
});

test('f.val(element)', function() {
	expect(5);
	var input = f.create('<input type="text" value="test">');
	equal(f.val(input), 'test', 'Get input value');

	var select = f.create('<select><option value="1">1</option><option value="2" selected>2</option></select>');
	equal(f.val(select), '2', 'Get select value');

	select = f.create('<select><option value="1">1</option><option value="2">2</option></select>');
	equal(f.val(select), 1, 'Get select first option value set by browser. When none options are selected');

	var multiselect = f.create('<select multiple><option value="one" selected>1</option><option value="two" selected>two</option></select>');
	deepEqual(f.val(multiselect), ['one', 'two'], 'Get multiple select values');

	var textarea = f.create('<textarea>Value</textarea>');
	equal(f.val(textarea), 'Value', 'Get textarea value');
});

test('f.css(element, style, value)', function() {
	expect(10);
	f.append(f('body'), '<div class="css"></div>');
	var css = f('.css');
	f.css(css, 'position', 'relative');
	equal(f.css(css, 'position'), 'relative', 'css position relative');

	f.css(css, 'opacity', 0.5);
	equal(f.css(css, 'opacity'), '0.5', 'css opacity');

	var div = f.create('<div></div>');
	ok(/auto|/.test(f.css(div, 'height')), 'Check not set height on disconnected node');

	f.css(div, 'height', '33px');
	equal(f.css(div, 'height'), '33px', 'Check set height on disconnected node');

	div = f.create('<div style="display: none;"><input type="text" style="height:20px;"><textarea style="height:30px"></textarea></div>');
	equal(f.css(f.find(div, 'input'), 'height'), '20px', 'Check height on hidden input');
	equal(f.css(f.find(div, 'textarea'), 'height'), '30px', 'Check height on hidden input');
	equal(f.css(div, 'display'), 'none', 'Check display style on disconnected node');

	f.css(div, 'font-size', '15px');
	equal(f.css(div, 'font-size'), '15px', 'Check font-size');

	f.css(div, 'height', '100%');
	equal(f.css(div, 'height'), '100%', 'Check height in percent');

	f.css(f('body'), 'height', '100%');
	equal(f.css(f('body'), 'height'), '100%', 'Check height in body');

	f.remove(css);
});

module('DOM Manipulations');
test('f.isDOM(element)', function() {
	expect(2);
	var div = f.create('<div></div>');
	strictEqual(f.isDOM(div), true, 'Check dynamically created element');
	strictEqual(f.isDOM(f('#qunit')), true, 'Check element got via selector');
});

test('f.parents(element, selector)', function() {
	expect(4);
	var div = f('#qunit');
	equal(f.parents(div).length, 2, 'Get all parents');

	equal(f.parents(div, 'body').length, 1, 'Get parent by tag selector');

	var elems = f.create('<div class="parent" id="pId"><div class="child"></div></div>'),
		child = f.find(elems, '.child');

	equal(f.parents(child, '.parent').length, 1, 'Get parent by class selector');
	equal(f.parents(child, '#pId').length, 1, 'Get parent by id selector');

});

test('f.parent(element)', function() {
	expect(3);
	var div = f('#qunit');

	equal(f.parent(div)[0].tagName.toLowerCase(), 'body', 'Get parent and check with tagName');
	equal(f.parent(f('html')).length, 0, 'No parent for html tag');
	deepEqual(f.parent(f('html')), [], 'No parent for html tag. Check with deepEqual');
});

test('f.closest(element, selector)', function() {
	expect(4);
	var div = f('#qunit');

	equal(f.closest(div, 'body')[0].tagName.toLowerCase(), 'body', 'Get closest by tag name');

	var elems = f.create('<div class="parent" id="pId"><div><div class="child"></div></div></div>'),
		child = f.find(elems, '.child');

	equal(f.closest(child, '.parent').length, 1, 'Get closest by class selector');
	equal(f.closest(child, '#pId').length, 1, 'Get closest by id selector');

	deepEqual(f.closest(f('html')), [], 'No closest element. Check with deepEqual');
});

test('f.children(element, selector)', function() {
	expect(6);
	var body = f('body');

	ok(f.children(body).length > 0, 'Get all body children');
	ok(f.children(body, 'div').length > 0, 'Get all children by tag selector');

	var qunit = f.children(body, '#qunit');
	equal(qunit.length, 1, 'Get child by id selector');

	f.addClass(qunit, 'test-class');
	equal(f.children(body, '.test-class').length, 1, 'Get child by class selector');
	equal(f.children(body, 'div.test-class').length, 1, 'Get child by query selector');

	deepEqual(f.children(body, '.no-children'), [], 'Check if no children');
});

test('f.siblings(element, selector)', function() {
	expect(5);
	var elements = f.create('<div class="one"></div><div class="two"></div><div id="three"></div>'),
		sibling = f(elements[0]);

	equal(f.siblings(sibling).length, 2, 'Get all siblings w\\o selector');
	equal(f.siblings(sibling, '.two').length, 1, 'Get sibling by class selector');
	equal(f.siblings(sibling, '#three').length, 1, 'Get sibling by id selector');
	deepEqual(f.siblings(sibling, '.noclass'), [], 'Get empty siblings result');

	var div = f.create('<div></div>');
	deepEqual(f.siblings(div), [], 'Get empty siblings result');
});

test('f.wrap(element, wrapper)', function() {
	expect(3);
	var div = f.create('<div></div>'),
		wrapper = f.create('<div class="wrapper"></div>');
	div = f.wrap(div, wrapper[0]);
	equal(f.attr(f.parent(div), 'class'), 'wrapper', 'Wrap with dynamically created element');

	div = f.create('<div class="wrap-me"></div>');
	f.wrap(div, 'div');
	equal(f.children(f.parent(div), '.wrap-me').length, 1, 'Wrap with tag name string argument');

	deepEqual(f.wrap(f('#noId'), 'div'), [], 'Wrap non existing element');
});

test('f.unwrap(element)', function() {
	expect(3);
	var divs = f.create('<div><div class="child"></div></div>'),
		child = f.children(divs);
	f.unwrap(child);

	deepEqual(f.parent(child), [], 'Unwrap element');
	deepEqual(f.unwrap(child), child, 'Unwrap element w\\o parent');

	divs = f.create('<div class="top-parent"><div><div class="child"></div></div></div>');
	child = f.find(divs, '.child');
	f.unwrap(child);

	equal(f.attr(f.parent(child), 'class'), 'top-parent', 'Make sure unwrap remove only parent');
});

test('f.append(element, children)', function() {
	expect(4);
	var child = f.create('<div class="append-child"></div>'),
		body = f('body');
	f.append(body, child);
	equal(f.attr(f.children(body, '.append-child'), 'class'), 'append-child', 'Check appended child');

	var divs = f.create('<div class="wrapper"></div><div class="wrapper"></div><div class="wrapper"></div>');
	f.append(body, divs);
	f.append(divs, child);
	equal(f('.append-child').length, 3, 'Check multi parent append');

	f.append(divs, f.create('<div class="multi-child"></div><div class="multi-child"></div>'));
	equal(f('.multi-child').length, 6, 'Check multi child, parent append');
	f.remove('.wrapper');

	f.append(body, '<div class="multi-child"></div><div class="multi-child"></div>');
	equal(f('.multi-child').length, 2, 'Check dynamically created children append');
	f.remove('.multi-child');
});

test('f.insertAfter(element, target)', function() {
	expect(5);
	var div = f.create('<div class="after-body"></div>'),
		body = f('body');
	f.insertAfter(div, body);
	equal(f.siblings(body, '.after-body').length, 1, 'Insert single div after body');
	equal(body[0].nextSibling.className, 'after-body', 'Be sure div inserted next after body');

	f.append(body, '<div class="inserts"></div><div class="inserts"></div>');
	f.append(body, '<div class="afterTarget"></div><div class="afterTarget"></div><div class="afterTarget"></div>');
	f.insertAfter(f('.inserts'), f('.afterTarget'));
	equal(f('.inserts').length, 6, 'Check multi insertAfter');

	f.insertAfter('<div id="dynamic"></div>', body);
	equal(f('#dynamic').length, 1, 'Check dynamically inserted element');
	equal(body[0].nextSibling.id, 'dynamic', 'Be sure element inserted next after body');
	f.remove('.after-body, .inserts, .afterTarget, #dynamic');
});

test('f.insertBefore(element, target)', function() {
	expect(5);
	var div = f.create('<div class="before-body"></div>'),
		body = f('body');
	f.insertBefore(div, body);
	equal(f.siblings(body, '.before-body').length, 1, 'Insert single div before body');
	equal(body[0].previousSibling.className, 'before-body', 'Be sure div inserted before body');

	f.append(body, '<div class="inserts"></div><div class="inserts"></div>');
	f.append(body, '<div class="beforeTarget"></div><div class="beforeTarget"></div><div class="beforeTarget"></div>');
	f.insertBefore(f('.inserts'), f('.beforeTarget'));
	equal(f('.inserts').length, 6, 'Check multi insertBefore');

	f.insertBefore('<div id="dynamic"></div>', body);
	equal(f('#dynamic').length, 1, 'Check dynamically inserted element');
	equal(body[0].previousSibling.id, 'dynamic', 'Be sure element inserted before body');
	f.remove('.before-body, .inserts, .beforeTarget, #dynamic');
});

test('f.remove(element)', function() {
	expect(3);
	f.append(f('body'), '<div id="remove"></div><div class="multi-remove"></div><div class="multi-remove2"></div><div class="element-remove"></div>');
	equal(f.remove('#remove').length, 1, 'Remove element by selector');
	equal(f.remove('.multi-remove, .multi-remove2').length, 2, 'Remove several elements by selector');
	var removeElement = f('.element-remove');
	f.remove(removeElement);
	equal(f('.element-remove').length, 0, 'Remove element via variable');
});

test('f.clone(element)', function() {
	expect(1);
	var body = f('body');
	f.append(body, '<div class="clone"></div><div class="clone"></div>')
	var clone = f.clone(f('.clone'));
	f.append(body, clone);
	equal(f('.clone').length, 4, 'Clone set of elements');
	f.remove('.clone');
});

test('f.find(element, selector)', function() {
	expect(3);
	var body = f('body'),
	elem = f.find(body, '#qunit');
	equal(f.attr(elem, 'id'), 'qunit', 'Find by id');

	elem = f.find(body, '.test-class');
	ok(f.hasClass(elem, 'test-class'), 'Find by class');

	elem = f.find(body, '#qunit ol#qunit-tests');
	equal(f.attr(elem, 'id'), 'qunit-tests', 'Find by query selector');
});

test('f.create(html)', function() {
	expect(2);
	var element = f.create('<div class="parent"><div class="child"></div></div>');
	equal(element.length, 1, 'Check elements length');

	var child = f.find(element, '.child');
	equal(f.attr(child, 'class'), 'child', 'Check child by class');
});

test('f.html(element, html)', function() {
	expect(2);
	var div = f.create('<div id="textText">Test text</div>');
	f.html(div, 'new html text');
	equal(f.html(div), 'new html text', 'Check set and get html text');

	f.html(div, '<div class="new-child"></div>');
	equal(f.children(div, '.new-child').length, 1, 'Check set children');
});

test('f.contents(element)', function() {
	expect(2);
	var content = f.contents(f('#iframe')),
	iBody = f.find(content, 'body');

	equal(f.children(iBody).length, 2, 'Check iframe contents');
	ok(f.contents(iBody).length, 'Check element contents');

	f.remove('#iframe');
});

test('f.contains(context, element)', function() {
	expect(2);
	var html = [document.documentElement],
	node = f.create('<div></div>');
	ok(!f.contains(html, node), 'This is disconnected node');

	node = f('#qunit');
	ok(f.contains(html, node), 'This is existing node');
});

test('f.text(element, text)', function() {
	expect(2);
	f.append(f('body'), '<div id="testText">Text node <div>Element text</div></div>');
	var element = f('#testText');

	equal(f.text([element[0].childNodes[0]]).trim(), 'Text node', 'Check text node text');
	equal(f.text(element).trim(), 'Text node Element text', 'Check element text content');

	f.remove(element);
});

test('f.offset(element)', function() {
	expect(4);
	f.append(f('body'), '<div id="abs" style="height: 10px; width: 10px; position: absolute; left: 24px; top:53px;"></div>');
	var coords = f.offset('#abs');
	equal(coords.left, 24, 'Left position');
	equal(Math.round(coords.top), 53, 'Left position');

	var div = f.create('<div></div>'),
	divCoords = f.offset(div);
	equal(divCoords.left, 0, 'Check disconnected node left position');
	equal(divCoords.top, 0, 'Check disconnected node top position');

	f.remove('#abs');
});

test('f.serialize(element)', function() {
	expect(7);
	var body = f('body'),

	form = f.create('<form><input type="text" name="first_name" value="My name"><input type="checkbox" value="1" checked name="agree"></form>');
	f.append(body, form);
	equal(f.serialize(form), 'first_name=My+name&agree=1', 'form with selected checkbox');
	f.remove(form);

	form = f.create('<form><input type="text" name="first_name" value="My name"><input type="checkbox" value="1" name="agree"></form>');
	f.append(body, form);
	equal(f.serialize(form), 'first_name=My+name', 'Form with unselected checkbox');
	f.remove(form);

	form = f.create('<form><input type="text" name="first_name" value="My name" disabled><input type="checkbox" value="1" checked name="agree"></form>');
	f.append(body, form);
	equal(f.serialize(form), 'agree=1', 'Form with disabled input');
	f.remove(form);

	form = f.create('<form><input type="text" name="first_name" value="My name" disabled><input type="checkbox" value="1" name="agree"></form>');
	f.append(body, form);
	equal(f.serialize(form), '', 'Form with disabled input and unchecked checkbox');
	f.remove(form);

	form = f.create('<form><input type="text" name="first_name" value="My name"><input type="radio" value="1" checked name="agree"></form>');
	f.append(body, form);
	equal(f.serialize(form), 'first_name=My+name&agree=1', 'Form with input and radio button');
	f.remove(form);

	form = f.create('<form><select multiple name="users[]"><option value="name1" selected>Name1</option><option value="name2">Name2</option><option value="name3" selected>Name3</option></select></form>');
	f.append(body, form);
	equal(f.serialize(form), 'users%5B%5D=name1&users%5B%5D=name3', 'Form multiple select');
	f.remove(form);

	form = f.create('<div><select name="user"><option value="name1">Name1</option><option value="name2" selected>Name2</option><option value="name3">Name3</option></select></div>');
	f.append(body, form);
	equal(f.serialize(form), 'user=name2', 'Serialize some context form element');
	f.remove(form);
});

test('f.domParser(data, type)', function() {
	expect(7);
	var htmlDoc = f.domParser('<body><div class="overlay">Text node</div></body>', 'text/html');
		var overlay = f.find([htmlDoc], '.overlay');
	equal(f.attr(overlay, 'class'), 'overlay', 'Check on child existing');
	equal(f.contents(overlay)[0].nodeValue, 'Text node', 'Check on text node');

	var xmlDoc = f.domParser('<?xml version="1.0"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don\'t forget me this weekend!</body></note>', 'application/xml'),
	note = f.find([xmlDoc], 'note');
	equal(note.length, 1, 'Make sure we got XML document');

	var from = f.find(note, 'from');
	equal(f.text(from).trim(), 'Jani', 'Get xml node text');

	var svgDoc = f.domParser('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><circle cx="100" cy="50" r="40" stroke="black"	stroke-width="2" fill="red" /></svg>', 'image/svg+xml'),
		svg = f.find([svgDoc], 'svg');
	equal(svg.length, 1, 'Get svg tag');
	equal(f.attr(svg, 'version'), '1.1', 'Check svg by attribute');

	var circle = f.find(svg, 'circle');
	equal(f.attr(circle, 'cx'), '100', 'Check circle cx attribute');
});

module('Events');
test('f.on(element, type, selector, handler)', function() {
	expect(6);
	var target = f.create('<div id="target"></div>'),
		flag = false,
		clicks = [];
	f.append(f('body'), target);
	f.on(target, 'click', function() {
		flag = true;
	});
	f.trigger(target, 'click');
	ok(flag, 'Check event execution');

	f.on(target, 'click', function() {
		clicks.push('one');
	});
	f.on(target, 'click', function() {
		clicks.push('two');
	});
	f.trigger(target, 'click');
	equal(clicks.length, 2, 'Check count of executed handlers');
	equal(clicks[1], 'two', 'Check sequence of executed handlers');

	var parent = f.create('<div class="parent"><div class="child"></div></div>'),
	child = f.find(parent, '.child'),
	delegated = false,
	bubble = false;

	f.append(f('body'), parent);
	f.on(parent, 'click', function() {
		bubble = true;
	});
	f.on(parent, 'click', '.child', function() {
		delegated = true;
	});

	f.trigger(child, 'click');
	ok(delegated, 'Check delegated event');
	ok(bubble, 'Parent handlers execution');

	var elements = f.create('<div class="target"></div><div class="target"></div>'),
		clicks = [];
	f.append(f('body'), elements);
	f.on(elements, 'click', function() {
		clicks.push(1);
	});
	f.trigger(elements, 'click');
	equal(clicks.length, 2, 'Check multi trigger');

	f.remove(parent);
	f.remove(target);
	f.remove(elements);
});

test('f.off(element, type, selector, handler)', function() {
	expect(5);
	var div = f.create('<div class="div"></div>'),
		off = true,
		off2 = true;
	f.on(div, 'click', function() {
		off = false;
	});
	f.off(div, 'click');
	f.trigger(div, 'click');
	ok(off, 'Event has been removed');

	function handler() {
		off = false;
	}
	function handler2() {
		off2 = false;
	}
	f.on(div, 'click', handler);
	f.on(div, 'click', handler2);
	f.off(div, 'click', handler);
	f.trigger(div, 'click');

	ok(off, 'Event has been removed by handler');
	ok(!off2, 'Second event was executed');

	f.on(div, 'click', handler);
	f.off(div, 'click');
	f.trigger('click');
	ok(off && !off2, 'All events has been removed by event type');

	f.on(div, 'mouseover', handler);
	f.on(div, 'click', handler2);
	f.off(div);
	f.trigger('mouseover');
	f.trigger('click');
	ok(off && !off2, 'All events has been removed');
});

test('f.trigger(element, event)', function() {
	expect(4);
	var div = f.create('<div></div>'),
		click = false;
	f.on(div, 'click', function() {
		click = true;
	});
	f.trigger(div, 'click');
	ok(click, 'Trigger simple event');

	div = f.create('<div class="trigger"></div><div class="trigger"></div>');
	var clicks = [];
	f.on(div, 'click', function() {
		clicks.push(1);
	});
	f.trigger(div, 'click');
	equal(clicks.length, 2, 'Multi trigger');

	div = f.create('<div class="wrapper"><div class="child"></div></div>');

	var body = f('body'),
		delegated = false,
		bubble = false;

	f.append(f('body'), div);
	f.on(div, 'click', '.child', function() {
		delegated = true;
	});
	f.on(div, 'click', function() {
		bubble = true;
	});

	f.trigger(f('.child'), 'click');
	ok(delegated, 'Run delegated method');
	ok(bubble, 'Trigger run event propagation');

	f.remove(div);
});

test('f.event(type, props)', function() {
	expect(3);
	var event = f.event(null, {ctrlKey: true, type: 'mouseover'});
	equal(event.type, 'mouseover', 'Check custom event type property');
	equal(event.ctrlKey, true, 'Check custom event ctrlKey property');

	event = f.event({type: 'click', shiftKey: true});
	equal(event.type, 'click', 'Check method return real event property');
});

module('AJAX');
test('f.isJSON(json)', function() {
	expect(6);
	ok(f.isJSON('[]'), 'Check empty array');
	ok(f.isJSON('[1,2,3]'), 'Check array with');
	ok(f.isJSON('[1,2,"text"]'), 'Check array with different type value');
	ok(f.isJSON('{"1":1,"2":"text","key":[]}'), 'Check object with different type value');
	ok(!f.isJSON("{'key':'value'}"), 'All json data should be in "');
	ok(!f.isJSON(""), 'Check json for empty string');
});

asyncTest('f.ajax(settings) - Simple request', 1, function() {
	f.ajax({
		type: 'get',
		url: 'ajax.php',
		success: function(data) {
			if(data === 'done') {
				ok(true, 'Simple ajax request and check success method');
				start();
			}
		}
	});
});

asyncTest('f.ajax(settings) - Send data object', 1, function() {
	f.ajax({
		type: 'get',
		url: 'ajax.php',
		data: {key: 22},
		success: function(data) {
			equal(data, '22', 'Check ajax data');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - Send data string', 1, function() {
	f.ajax({
		type: 'get',
		url: 'ajax.php',
		data: 'key=text',
		success: function(data) {
			equal(data, 'text', 'Check ajax data in text form');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - Default responseType', 1, function() {
	f.ajax({
		type: 'get',
		url: 'ajax.php',
		data: 'key=text',
		success: function(data) {
			strictEqual(typeof data, 'string', 'Default repsoneType is "text"');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - ResponseType "json"', 1, function() {
	f.ajax({
		type: 'get',
		url: 'ajax.php',
		data: 'response=json',
		responseType: 'json',
		success: function(data) {
			ok(f.isObject(data), 'Check responseType "json"');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - ResponseType "document"', 1, function() {
	f.ajax({
		type: 'get',
		url: 'xml.xml',
		responseType: 'document',
		success: function(doc) {
			equal(doc.nodeType, 9, 'Check responseType "document"');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - Error callback', 2, function() {
	f.ajax({
		type: 'post',
		url: 'ajax.php',
		data: 'error=1',
		error: function(xhr) {
			equal(xhr.status, 404, 'Check error callback');
			equal(xhr.statusText, 'Not Found', 'Check error statusText');
			start();
		}
	})
});

asyncTest('f.ajaxSettings(options)', 1, function() {
	f.ajaxSettings({
		type: 'post'
	});
	f.ajax({
		url: 'ajax.php',
		data: {post: 1},
		success: function(data) {
			equal(data, 'post', 'Check ajax global settings');
			start();
		}
	});
});

module('Support');

test('f.extend(key, value)', function() {
	expect(4);
	f.extend('custom', 1);
	equal(typeof f.custom, 'number', 'FastJs has been extended');
	equal(f.custom, 1, 'Check extended property');

	f.extend('custom', function() { return 'result'; });
	equal(typeof f.custom, 'function', 'Property has been overwritten');
	equal(f.custom(), 'result', 'Check extended property');
});

test('f.each(object, handler)', function() {
	expect(4);
	var obj = {key1: 'val1', key2: 'val2'},
		arr = [1, 2, 'hello', [], {}],
		length = 0;
	f.each(obj, function(key, val) {
		if(key === 'key1') {
			equal(this, 'val1', 'Check this in handler');
		}
	});

	f.each(arr, function(index, val) {
		length++;
		if(index == 1) {
			equal(this, 2, 'Check this in handler');
		}
		else if(index == 3) {
			ok(f.isArray(this), 'Val is Array');
		}
	});

	equal(length, arr.length, 'Make sure f.each goes through all array elements');
});

test('f.merge()', function() {
	expect(4);
	var merge = f.merge([1,3], [5,2]);
	equal(merge[2], 5, 'Check two arrays merge');

	merge = f.merge([], [23, 'text'], [[]]);
	ok(Array.isArray(merge[2]), 'Check three array merge');

	merge = f.merge({key1: 1},{key2: 2});
	equal(merge.key2, 2, 'Check two object merge');

	merge = f.merge({key1: 1},{key1: 2});
	equal(merge.key1, 2, 'Check object duplicate keys overwrite previous');
});

test('f.isArray(arr)', function() {
	expect(2);
	ok(f.isArray([]), 'Is Array');
	ok(!f.isArray({}), 'Is not an Array');
});

test('f.isObject(obj)', function() {
	expect(3);
	ok(f.isObject({}), 'Is Object');
	ok(f.isObject(f.merge({},{})), 'f.merge returns an Object');
	ok(!f.isObject([]), 'Is not an Object');
});

test('f.isString(str)', function() {
	expect(3);
	ok(f.isString('hello'), 'Is String');
	ok(f.isString('hello' + 32), 'Is String');
	ok(!f.isString(2), 'Is not a String');
});

test('f.isNumber(num)', function() {
	expect(3);
	ok(f.isNumber(323), 'Is Number');
	ok(f.isNumber(32.3323), 'Is Number');
	ok(!f.isNumber('hello'), 'Is not a Number');
});

test('f.isFunction(fn)', function() {
	expect(3);
	ok(f.isFunction(function(){}), 'Is Function');
	ok(!f.isFunction(new function(){}), 'Is not a Function');
	ok(!f.isFunction({}), 'Is not a Function');
});

test('f.cookie(name, value, props, secure)', function() {
	expect(5);
	f.cookie('name', 'My name');
	equal(f.cookie('name'), 'My name', 'Check simple cookie set');

	f.cookie('name2', 'My name2', {path: '/test/fakepath'});
	equal(f.cookie('name2'), undefined, 'Cookie is set for another path');

	f.cookie('name', null, {expires:-1});
	equal(f.cookie('name'), undefined, 'Remove cookie');

	f.cookie('name2', null, {expires:-1});
	equal(f.cookie('name2'), undefined, 'Cookie from another path is not removable');

	f.cookie('name2', 'Custom', {expires:-1});
	equal(f.cookie('name2'), undefined, 'Cookie from another path is not editable');
});

asyncTest('f.cookie(name, value, pros, secure)', 1, function() {
	f.cookie('expired', '10 seconds', {expires: 2});
	setTimeout(function() {
		equal(f.cookie('expired'), undefined, 'Set cookie for 10 seconds');
		start();
	}, 2500);
});

module('AJAX');
asyncTest('f.ajax(settings) - Upload progress callback', 1, function() {
	f.append(f('body'), '<input type="file" id="file">');
	var upSteps = 0,
	file = f('#file');
	f.on(file, 'change', function() {
		var img = this.files[0];
		f.ajax({
			type: 'post',
			url: 'ajax.php',
			data: img,
			dataFile: true,
			upProgress: function(a, b) {
				upSteps++;
			},
			success: function(data) {
				ok(upSteps > 0, 'Check upload progress');
				f.remove(file);
				start();
			}
		});
	});
	file[0].click();
});

asyncTest('f.ajax(settings) - Download progress callback', 1, function() {
	var downSteps = 0;
	f.ajax({
		type: 'post',
		url: 'logo.png',
		downProgress: function(loaded, total) {
			downSteps++;
		},
		success: function() {
			ok(downSteps > 0, 'Check download progress');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - ResponseType "arraybuffer"', 1, function() {
	f.ajax({
		type: 'get',
		url: 'logo.png',
		responseType: 'arraybuffer',
		success: function(buffer) {
			equal(buffer.byteLength, 2641, 'Check responseType "blob"');
			start();
		}
	});
});

asyncTest('f.ajax(settings) - ResponseType "blob"', 1, function() {
	f.ajax({
		type: 'get',
		url: 'logo.png',
		responseType: 'blob',
		success: function(blob) {
			equal(blob.type, 'image/png', 'Check responseType "blob"');
			start();
		}
	});
});