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

	equal(f.siblings(sibling).length, 2, 'Get all siblings w\o selector');
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
	equal(f.children(div, '.wrap-me').length, 1, 'Wrap with tag name string argument');

	deepEqual(f.wrap(f('#noId'), 'div'), [], 'Wrap non existing element');
});