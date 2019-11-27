# cocholate

> "Why cocholate? Because it goes well with [vanilla](http://vanilla-js.com)." -- cocholate's PR.

cocholate is a small library for DOM manipulation. It's meant to be small, easily understandable and fast.

## Current status of the project

The current version of cocholate, v2.2.0, is considered to be *stable* and *complete*. [Suggestions](https://github.com/fpereiro/cocholate/issues) and [patches](https://github.com/fpereiro/cocholate/pulls) are welcome. Besides bug fixes, there are no future changes planned.

cocholate is part of the [ustack](https://github.com/fpereiro/ustack), a set of libraries to build web applications which aims to be fully understandable by those who use it.

## Installation

The dependencies of cocholate are two:

- [dale](https://github.com/fpereiro/dale)
- [teishi](https://github.com/fpereiro/teishi)

cocholate is written in Javascript. You can use it in the browser by sourcing the dependencies and the main file:

```html
<script src="dale.js"></script>
<script src="teishi.js"></script>
<script src="cocholate.js"></script>
```

Or you can use these links to the latest version - courtesy of [jsDelivr](https://jsdelivr.com).

```html
<script src="https://cdn.jsdelivr.net/gh/fpereiro/dale@7e1be108aa52beef7ad84f8c31649cfa23bc8f53/dale.js"></script>
<script src="https://cdn.jsdelivr.net/gh/fpereiro/teishi@93b977548301d17f8b2fb31a60242ceed810b1f1/teishi.js"></script>
<script src="https://cdn.jsdelivr.net/gh/fpereiro/cocholate@aaeb5f1270ca1338381ffe892480404295044281/cocholate.js"></script>
```

cocholate is exclusively a client-side library. Still, you can find it in npm: `npm install cocholate`

Browser compatibility has been tested in the following browsers:

- Google Chrome 15 and above.
- Mozilla Firefox 3 and above.
- Safari 4 and above.
- Internet Explorer 6 and above.
- Microsoft Edge 14 and above.
- Opera 10.6 and above.
- Yandex 14.12 and above.

The author wishes to thank [Browserstack](https://browserstack.com) for providing tools to test cross-browser compatibility.

<a href="https://www.browserstack.com"><img src="https://bstacksupport.zendesk.com/attachments/token/kkjj6piHDCXiWrYlNXjKbFveo/?name=Logo-01.svg" width="150px" height="33px"></a>

## Loading cocholate

As soon as you include cocholate, it will be available on `window.c`.

```javascript
var c = window.c;
```

A couple notes regarding [polyfills](https://en.wikipedia.org/wiki/Polyfill_(programming)):

- If cocholate detects that the DOM method `insertAdjacentHTML` is not defined, cocholate will set it (this will [only happen](https://caniuse.com/#feat=insertadjacenthtml) in Firefox 7 and below and Safari 3 and below).
- Because cocholate uses [teishi](https://github.com/fpereiro/teishi), the `indexOf` method for arrays will also be set (this will happen only in Firefox 1, Edge 12 and below and Internet Explorer 8 and below).

## Selectors

`c` is the main function of the library. It takes a `selector` and an optional `fun`.

Let's go with the simplest case:

```javascript
// This code will return an array with all the divs in the document.
c ('div');
```

```javascript
// This code will return an array with all the elements that have the class .nav.
c ('.nav');
```

Whenever you pass a string as a `selector` and no other arguments, cocholate simply uses the native [document.querySelectorAll](http://www.w3schools.com/jsref/met_document_queryselectorall.asp), with the sole difference that returns an array instead of a [NodeList](http://www.w3schools.com/jsref/met_document_queryselectorall.asp).

A very important exception is when you pass a string selector that targets an id, such as `#hola` or `div#hola`, you won't get an array - instead, you'll get either the element itself, or `undefined`:

```javascript
// This code will return the div with id `hola`
c ('#hola');

// This code will do the same thing.
c ('#hola');

// This code, however, won't do the same thing, though it means the same thing.
c ('body #hola');

// This code will return an array, since it targets the children of an element.
c ('#hola p');
```

Note: in old browsers that do not support `querySelectorAll` (Firefox 3 and below, Internet Explorer 7 and below), cocholate provides a limited variety of selectors, with the following shapes: `TAG`, `#ID`, `.CLASS`, `TAG#ID` and `TAG.CLASS`. In these old browsers, if you use a selector that does not conform to these specific forms, cocholate will print an error and return `false`.

If instead of searching from all elements you want to search within a specific element, instead of a string selector you can use an object with the form `{selector: SELECTOR, from: FROM}`, where `SELECTOR` is the string selector and `FROM` is an DOM element. For example:

```javascript
// This will return all divs with class `hello` from the body
c ({selector: 'div', from: c ('body') [0]});

// This will return all paragraphs with class `hello` from a div with id `hello`
c ({selector: 'div', from: document.getElementById ('hello')});

// This is equivalent to the last thing we did
c ({selector: 'div', from: c ('div#hello')});
```

If you want to use the logical operations `and`, `not` and `or`, you can do so by using a `selector` that's an array where the first element is either `':and'`, `':or'` or `':not'`.

```javascript
// This code will return an array with all the elements that are `div` or `p`
c ([':or', 'div', 'p']);

// This code will return an empty array (because there are no elements that can be simultaneously a `div` and a `p`).
c ([':and', 'div', 'p']);

// This code will return an array with all the elements that are neither `div` or `p`.
c ([':not', 'div', 'p']);
```

You can also nest the selectors to an arbitrary degree, as long as the first element of each nested array selector is one of `':and'`, `':or'` or `':not'`:

```javascript
// This code will return an array with all the elements that are `div` or `p` and are contained inside `body`.
c ([':and', 'body *', [':or', 'div', 'p']]);
```

A subtle point: when you pass multiple elements to a `':not'` selector, it is actually equivalent to using the `':or'` selector. For example, `[':not', 'div', 'p']` is equivalent to writing `[':not', [':or', 'div', 'p']]`. The reason for this disambiguation is that `and` and `or` are operations on two operands, where `not` is an unary operation. The choice of `or` instead of `and` reflects what I believe is the most intuitive and common usage of `not` for multiple operands.

```javascript
// These two calls will return the same result.
c ([':not', 'div', 'p']);
c ([':not', [':or', 'div', 'p']]);
```

If you want to perform an operation on a certain DOM element, you can directly pass it to `c`.

```javascript
// These two calls are equivalent.
c ('#hello');
c (document.getElementById ('hello'));
```

## `fun`

Besides returning an array of DOM elements, we will want to do some operations on them. To do this, we can pass a second argument to `c`, which is a function that will be executed for every element that matched the selector. The results will be collected on an array that's then returned.

For example, the following call will return an array with the ids of all the `divs` in the document.

```javascript
c ('div', function (e) {
   return e.getAttribute ('id');
});
```

All the following DOM functions are implemented as underlying calls to `c`, passing its specific logic as the second argument to `c`.

## DOM functions

All the functions presented in this section take a `selector` as its first element and execute its logic for each of the elements matching the selector.

### `c.empty`

`c.empty` [removes](https://www.tutorialspoint.com/prototype/prototype_element_remove.htm) all the DOM elements within the elements matched by the selector. In other words, it completely gets rid of all the DOM elements nested inside of the matching elements. This function has no meaningful return value. If an invalid selector was passed to this function, an error will be printed.

### `c.fill`

`c.fill` takes `html` (an HTML string) as its second argument, and first empties the element and then fills it with the provided HTML string. This function has no meaningful return value. If an invalid selector was passed to this function, an error will be printed.

### `c.place`

`c.place` takes `where` as its second argument and `html` as its third. `where` can be one of `'beforeBegin'`, `'afterBegin'`, `'beforeEnd'`, `'afterEnd'`, and `html` is an HTML string. This function has no meaningful return value. Its functionality is based on that of [insertAdjacentHTML](https://msdn.microsoft.com/en-us/library/ms536452(v=vs.85).aspx).

To explain what this function does, an example serves best. If you start with the following HTML:

```html
<div id="vamo">
</div>
```

If you would execute the following function call:

```javascript
c.place ('#vamo', 'beforeBegin', '<p>beforeBegin</p>');
```

You would end up with the following HTML.

```html
<p>beforeBegin</p>
<div id="vamo">
</div>
```

If you then do the following three calls:

```javascript
c.place ('#vamo', 'afterBegin', '<p>beforeBegin</p>');
c.place ('#vamo', 'beforeEnd', '<p>beforeEnd</p>');
c.place ('#vamo', 'afterEnd', '<p>afterEnd</p>');
```

You will get:

```html
<p>beforeBegin</p>
<div id="vamo">
<p>afterBegin</p>
<p>beforeEnd</p>
</div>
<p>afterEnd</p>
```

### `c.get`

`c.get` is useful for fetching attributes from elements. It takes `attributes` as its second argument (which can be `undefined`, a string or an array of strings, each of them representing an attribute name) and an optional boolean third parameter `css` which marks whether you want to get CSS properties instead of DOM ones.

For each of the matching elements, this function will return an object where the key is the attribute name and the corresponding value is the attribute value. All these objects are wrapped in an array (with the sole exception of a selector that targets an id).

For example, if you have the following HTML:

```html
<p id="a" class="red"></p>
<p id="b" class="blue"></p>
<p id="c" class="green"></p>
```

And you run this code:

```javascript
c.get ('p', 'class');
```

You'll get an array with three objects: `[{class: 'red'}, {class: 'blue'}, {class: 'green'}]`.

If you run this code:

```javascript
c.get ('p', ['id', 'class']);
```

You'll get an array with three objects but two properties each: `[{id: 'a', class: 'red'}, {id: 'b', class: 'blue'}, {id: 'c', class: 'green'}]`.

As with `c`, if you pass a selector that targets the id of an element, you will get the attributes themselves without them being wrapped in an array:

```javascript
c.get ('#a', 'class');  // will return {class: 'red'}
c.get ('p#a', 'class'); // will also return {class: 'red'}
```

Using the `css` attribute, you can obtain the CSS properties of an element. Consider this example:

```html
<p style="color: red;"></p>
<p style="color: blue;"></p>
<p style="color: green;"></p>
```

```javascript
c.get ('p', 'color', true);
```

If you run this code on the above HTML, you will obtain an array with three objects: `[{color: 'red'}, {color: 'blue'}, {color: 'green'}]`.

Finally, either with normal attributes or CSS ones, if the attribute is not present, you will get `null` as its value. For example:

```javascript
c.get ('p', 'name');         // will return `[{name: null}]`
c.get ('p', 'height', true); // will return `[{height: null}]`
```

If `attributes` is `undefined`, *all* the attributes will be returned, except those with falsy values (like `null`, `''`, `false`, 0 and `false`). If you want to bring all CSS attributes, you can explicitly pass `undefined` as a second argument; note that this will bring only the inline CSS attributes, and not the computed CSS values for the element.

### `c.set`

This function is similar to `c.get`, except that it *sets* the attributes instead of getting them. This function has no meaningful return value.

This function takes a selector as first argument, and as second argument an object with all the properties you wish to set. An optional `css` flag is the third argument, in order to set inline CSS properties.

If you have the following HTML:

```html
<p>
</p>
```

```javascript
c.set ('p', {class: 'someclass'});
```

The HTML will look like this:

```html
<p class="someclass">
</p>
```

To remove an attribute, just pass `null` as the attribute value. If you execute this code:

```javascript
c.set ('body p', {class: null});
```

The HTML will go back to its original state:

```html
<p>
</p>
```

If you pass a truthy third argument, you'll set/unset CSS properties instead.

```javascript
c.set ('body p', {color: 'red'}, true);
```

Now the HTML will look like this:

```html
<p style="color: red;">
</p>
```

To remove the style property, you can also use `null` as a value:

```javascript
c.set ('body p', {color: null}, true);
```

Now the HTML will look like this:

```html
<p style="">
</p>
```

By default, if the element whose attribute is being modified has an `onchange` event handler, the `onchange` event will be automatically triggered. For example:

```html
<input id="hello">
<script>
   c ('#hello').onchange = function () {
      alert (this.value);
   }

   c.set ('#hello', {value: 2});
</script>
```

Because of the event handler that we assigned to `#hello`, we will see an alert with the value `2`.

This also is the case with CSS events. For example, this call to `c.set` will also trigger the `onchange` event:

```html
<input id="hello">
<script>
   c ('#hello').onchange = function () {
      alert (this.style.color);
   }

   c.set ('#hello', {color: 'lime'}, true);
</script>
```

If you want to override this behavior, you can simply pass a truthy fourth argument:

```javascript
// for normal attributes
c.set ('#hello', {value: 2}, false, true);

// for CSS attributes
c.set ('#hello', {color: 'lime'}, true, true);
```

### `c.fire`

This function creates an event and triggers it on the specified elements. It takes an `eventType` as its second argument, a string that determines which argument is fired (for example, `'click'`). This function has no meaningful return value.

```javascript
c.fire ('#button', 'click');
```

`c.fire` is useful for test scripts that simulate user interactions.

Note: if you're using this function in Internet Explorer 8 and below, you need to prefix `eventType` with `'on'`: for example, `'click'` should be `'onclick'`.

## Non-DOM functions

Besides the six DOM functions, there are four more for a few things that are convenient to have around.

### `c.ready`

A function that gets executed when the HTML page and all its resources (including stylesheets and scripts) have finished loading. Takes a single argument, `fun`, containing the code to be executed when this event happens.

This function is handy to prevent executing your application code before all scripts are loaded. This will happen automatically on most browsers if you place all your scripts at the bottom of the body - the exception is Internet Explorer 8 and below, which seem to run the scripts in parallel.

This function is also handy if you want to wait for all stylesheets to load before executing your script.

### `c.cookie`

Quick & dirty cookie parsing. Takes an optional argument, `cookie`, a cookie string that will be parsed. If you don't pass any arguments, this function will read the cookie at `document.cookie` instead.

This function returns an object with keys/values, each of them pertaining to a property of the cookie.

If you pass `false` as the argument, `c.cookie` will delete all the cookies.

### `c.ajax`

This function can make ajax calls and provides a few conveniences.

It takes five arguments:

- `method`: a string. Defaults to `'GET'` if you pass a falsy argument.
- `path`: a string with the target path.
- `headers`: an object where every value is a string. Defaults to `{}` if you pass a falsy argument.
- `body`: the body of the request. Defaults to `''` if you pass a falsy argument.
- `callback`: a function to be executed after the request is completed. Defaults to an empty function if you pass a falsy argument.

The conveniences provided are:

- You can directly pass a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object, useful for `multipart/form-data` requests.
- If you pass an array or object as `body`, the `content-type` header will be automatically set to `application/json` and the body will be stringified.
- All ajax requests done through this function are asynchronous.
- The function will synchronously return an object of the form `{headers: ..., body: ..., xhr: <the request object>}` (corresponding to the request data).
- If the response has a code 200 or 304, the callback will receive `null` as its first argument and the following object as the second argument: `{headers: {...}, body: ..., xhr: <the request object>}`. If the `Content-Type` response header is `application/json`, the `body` will be parsed - if the `body` turns out to be invalid JSON, its value will be `false`.
- If the code is not 200 or 304, the request object will be received as the first argument. The request object contains all the relevant information, including payloads and errors.

### `c.loadScript`

This function requests a script and places it on the DOM, at the bottom of the body. It takes two arguments: `src`, the path to the javascript file; and a `callback` that is executed after the script is fetched.

If the script is successfully fetched, `callback` will receive two arguments (`null` and the request object); in case of error, it will receive the request object as its first argument. `c.loadScript` uses `c.ajax` to retrieve the script asynchronously.

## Source code

The complete source code is contained in `cocholate.js`. It is about 300 lines long.

Below is the annotated source.

```javascript
/*
cocholate - v2.2.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/
```

### Setup

We wrap the entire file in a self-executing anonymous function. This practice is commonly named [the javascript module pattern](http://yuiblog.com/blog/2007/06/12/module-pattern/). The purpose of it is to wrap our code in a closure and hence avoid making the local variables we define here to be available outside of this module.

```javascript
(function () {
```

If we're in node.js, we print an error and return `undefined`.

```javascript
   if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');
```

We require [dale](http://github.com/fpereiro/dale) and [teishi](http://github.com/fpereiro/teishi). Note that, in the browser, `dale` and `teishi` will be loaded as global variables.

```javascript
   var dale   = window.dale;
   var teishi = window.teishi;
```

We create an alias to `teishi.type`, the function for finding out the type of an element. We do the same for `teishi.clog`, a function for printing logs that also returns `false`.

```javascript
   var type = teishi.type, clog = teishi.clog;
```

### Polyfill for `insertAdjacentHTML`

We will define a [polyfill](https://en.wikipedia.org/wiki/Polyfill_(programming)) for `insertAdjacentHTML`, which will be necessary in old versions of Safari and Firefox. It is based on [Eli Grey's polyfill](https://gist.github.com/eligrey/1276030).

We set the function only if it's not defined. The function takes two arguments, `position` and `html`.

```javascript
   if (! document.createElement ('_').insertAdjacentHTML) HTMLElement.prototype.insertAdjacentHTML = function (position, html) {
```

We create a container element and then we set its `innerHTML` property to the `html` we received as a string. This will create all the desired DOM nodes inside `container`.

```javascript
      var container = document.createElement ('div');
      container.innerHTML = html;
```

We now iterate the outermost elements inside `container`. By outermost, I mean that only those elements that are direct children of `container` will be iterated - whereas elements that are inside these top-level children will not be iterated.

We're, however, iterating the elements in a rather strange way. Instead of using a for loop or an equivalent functional construct, we're executing the same piece of code as long as container has one element. How can this work without setting us for an infinite loop? Let's see it in a minute.

```javascript
      while (container.firstChild) {
```

If `position` is `beforeBegin`, we place `container.firstChild` before the element, using the `insertBefore` method on the element's parent.

Once we do this, `container.firstChild` (the first element we're positioning) will be in its desired position and not on `container` anymore. in this way, the next time the while loop runs, `container.firstChild` will be the second element we want to place - and if there's no second element, the loop will be finished.

```javascript
         if      (position === 'beforeBegin') this.parentNode.insertBefore (container.firstChild, this);
```

If `position` is `afterBegin`, we place `container.firstChild` as the first children of the element using the `insertBefore` method on the element itself.

```javascript
         else if (position === 'afterBegin')  this.insertBefore            (container.firstChild, this.firstChild);
```

If `position` is `beforeEnd`, we merely append `container.firstChild` to the element.

```javascript
         else if (position === 'beforeEnd')   this.appendChild             (container.firstChild);
```

Finally, if `position` is `afterEnd`, we place `container.firstChild` just after the element using the `insertBefore` method on the parent.

```javascript
         else                                 this.parentNode.insertBefore (container.firstChild, this.nextElementSibling)
```

There's nothing else to do, so we close the loop and the polyfill function.

```javascript
      }
   }
```

### Core

We define `c`, the main function of the library. Note we also attach it to `window.c`, so that it is globally available to other scripts. This function takes two arguments, `selector` and `fun`.

`c`, besides being a function, will serve as an object that collects the other functions of the library.

```javascript
   var c = window.c = function (selector, fun) {
```

We check that `fun` is a function or `undefined`. If it is neither, an error is printed and the function returns `false`.

```javascript
      if (teishi.stop ('c', ['fun', fun, ['function', 'undefined'], 'oneOf'])) return false;
```

We create a local variable that will indicate whether the `selector` is actually a DOM node.

```javascript
      var selectorIsNode = selector && selector.nodeName;
```

We define a local variable `elements` that will contain all the DOM elements to which `selector` refers. If the selector is itself a DOM node, we wrap it in an array. Otherwise, the search for all matching elements is done by `c.find`, a function which we'll see below.

```javascript
      var elements = selectorIsNode ? [selector] : c.find (selector);
```

If `c.find` returns `false`, this means that the selector is invalid. In this case, `c.find` will have already printed an error message. We return `false`.

```javascript
      if (elements === false) return false;
```

If we're here, the input is valid.

If `fun` was passed, we first collect all extra arguments passed to `c` into an array named `args`. This array will always exclude `selector` and `fun`. If no extra arguments were passed, `args` will be an empty array.

```javascript
      if (fun) {
         var args = dale.go (arguments, function (v) {return v}).slice (2);
```

We iterate through `elements`, the DOM elements that match `selector`. For each of them, we apply them to `fun`, with each of them as the first argument and further arguments also passed. We collect the results of these function applications into an array and set it to `elements`.

This means that if `fun` is present, `elements` will contain the results of passing each of `elements` to `fun` - whereas if `fun` is absent, `elements` will contain the DOM elements themselves.

```javascript
         elements = dale.go (elements, function (v) {
            return fun.apply (undefined, [v].concat (args));
         });
      }
```

If the selector a DOM node, or if it is of the form `#ID` or `TAGNAME#ID`, we return the first (and only) element of `elements`.

```javascript
      if (selectorIsNode || (type (selector) === 'string' && selector.match (/^[a-z0-9]*#[^\s\[>,:]+$/))) return elements [0];
```

Otherwise, we return the entire array of `elements`. There's nothing else to do, so we close the function.

```javascript
      else                                                                         return elements;
   }
```

`c.nodeListToArray` is a helper function that converts a [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) into a plain array containing DOM elements. Whenever the browser returns a NodeList, we convert it into a plain array - this simplifies iteration, especially in old browsers. This function takes a single `nodeList` as its argument; since we always pass it a valid NodeList, we don't validate its input.

```javascript
   c.nodeListToArray = function (nodeList) {
```

We define an `output` array.

```javascript
      var output = [];
```

We iterate `nodeList` with a plain old for loop. We cannot use `dale.go` here since Safari 5.1 and below consider `nodeList` to be of type `function`.

```javascript
      for (var i = 0; i < nodeList.length; i++) {
```

We push each of the elements to `output`.

```javascript
         output.push (nodeList [i]);
      }
```

We return `output` and close the function.

```javascript
      return output;
   }
```

We define `c.setop`, a helper function that performs set operations (`and`, `or` and `not`). This function takes an operation (`and|or|not`) and two arrays of DOM elements. Each of these sets are compared according to the given operation.


```javascript
   c.setop = function (operation, set1, set2) {
```

If the operation is `and`, we go through the first set and create a new array filtering out those elements from the first set that are not present on the second set. We return this filtered first set, which represents an intersection of both sets.

```javascript
      if (operation === 'and') return dale.fil (set1, undefined, function (v) {
         return set2.indexOf (v) > -1 ? v : undefined;
      });
```

We copy the first set onto a new array `output`, since we don't want to modify it.

```javascript
      var output = set1.slice ();
```

If the operation is `or`, we iterate the elements of the second set. Each of the elements of the second set that are not on the first set will be pushed onto output. `or` represents an union of both sets.

```javascript
      if (operation === 'or') {
         dale.go (set2, function (v) {
            if (output.indexOf (set2) === -1) output.push (v);
         });
      }
```

If we're here, the operation is `not`. In this case, we want to substract the second set from the first.

```javascript
      else {
```

If the first set is empty, we put in `output` all the elements from the document.

```javascript
         if (output.length === 0) output = c.nodeListToArray (document.getElementsByTagName ('*'));
```

We remove from `output` all the elements that are present in the second set.

```javascript
         dale.go (set2, function (v) {
            var index = output.indexOf (v);
            if (index > -1) output.splice (index, 1);
         });
      }
```

We return `output` and close the function.

```javascript
      return output;
   }
```

`c.find` is a function that resolves a cocholate selector into a set of DOM elements. It is used by the main (`c`) function to find elements. It takes a single argument, `selector`.

```javascript
   c.find = function (selector) {
```

We get the type of `selector`.

```javascript
      var selectorType = type (selector);
```

`selector` must be either an array, a string or an object.

```javascript
      if (teishi.stop ('cocholate', [
         ['selector', selector, ['array', 'string', 'object'], 'oneOf'],
```

If `selector` is an array, its first element must be a string with a colon plus one of the operations `and`, `or` and `not`.


```javascript
         function () {return [
            [selectorType === 'array',  ['first element of array selector', selector [0], [':and', ':or', ':not'], 'oneOf', teishi.test.equal]],
```

If `selector` is an object, its keys must be `selector` and `from`. `selector.selector` must be an array or string.

```javascript
            [selectorType === 'object', [
               ['selector keys', dale.keys (selector), ['selector', 'from'], 'eachOf', teishi.test.equal],
               ['selector.selector', selector.selector, ['array', 'string'], 'oneOf'],
```

Now we validate `selector.from`. We expect it to be a DOM element. If the browser supports `querySelectorAll`, we check that the DOM element is valid by testing whether the `querySelectorAll` element exists for the given `selector.from`.

An implementation note: we write this last validation rule as a function and not an array because Internet Explorer 8 and below throw a strange error when placing DOM elements within a teishi array rule.

```javascript
               function () {
                  if (type (selector.from) !== 'object' || (document.querySelectorAll && ! selector.from.querySelectorAll)) return clog ('teishi.v', 'selector.from passed to cocholate must be a DOM element.');
                  return true;
               }
```

If any of the validations fail, we print an error and return `false`.

```javascript
            ]]
         ]}
      ])) return false;
```

First we'll cover the cases where `selector` is either a string or an object.

```javascript
      if (selectorType !== 'array') {
```

If the browser supports `querySelectorAll` (which should happen for any of the browsers we support except Firefox 3 and below and Internet Explorer 7 and below) and `selector` is a string, we merely invoke `document.querySelectorAll` on it, convert the NodeList into an array, and return it.

```javascript
      if (document.querySelectorAll && selectorType === 'string') return c.nodeListToArray (document.querySelectorAll (selector));
```

If `selector` is an object, we invoke `querySelectorAll` on `selector.from` (which is a DOM element) and we use `selector.selector` as the selector. We also convert the NodeList into an array and return it.

```javascript
         if (document.querySelectorAll && selectorType === 'object') return c.nodeListToArray (selector.from.querySelectorAll (selector.selector));
```

If we're here, we're still dealing with a string or object selector, but on either Firefox 3 and below or Internet Explorer 7 and below. This is where it gets fun. In this section, we'll write code to provide limited selector support to these old browsers.

We define a variable `from` that will be the context for selecting DOM elements. It will be `selector.from` (if defined) or `document` (if `selector` is a string).

```javascript
         var from = selector.from ? selector.from : document;
```

If `selector` is an object, we reassign it to `selector.selector`.

```javascript
         selector = selectorType === 'string' ? selector : selector.selector;
```

We are going to provide limited support for selectors; namely, we will only support selectors of these shapes: `TAG`, `TAG#ID`, `TAG.CLASS`, `#ID`, `.CLASS`. Note that we also support `*`, since it's possible to pass a wildcard to `document.getElementsByTagName` (which means that all elements will be selected).

If `selector` doesn't conform to any of these shapes, we will print an error and return false.

```javascript
         if (selector !== '*' && ! selector.match (/^[a-z0-9]*(#|\.)?[a-z0-9]+$/i)) return clog ('The selector ' + selector + ' is not supported in IE <= 7 or Firefox <= 3.');
```

If we're here, `selector` is supported. We will now determine what's the criterium for selecting elements; if there's a `#` in the selector, it will be by `id`; if there's a `.`, it will be by `class`. If there's neither, we'll set it to `undefined` (in which case it means that we will select elements by tag).

```javascript
         var criterium = selector.match ('#') ? 'id' : (selector.match (/\./) ? 'class' : undefined);
```

We split `selector` by either `#` or `.`.

```javascript
         selector = selector.split (/#|\./);
```

We define `tag`, a variable that will indicate whether we filter our elements to belong to a certain tag name. If selector was split in two (because there's either a hashtag or a dot), we'll set `tag` to its first element; if it was not split in two (which means absence of both hashtag and dot), we'll also set `tag` to its first element. If selector has length 1 and there's a class or hashtag present, then `tag` will be `undefined` (because selector will only contain `class` or `id` information).

Note that, if present, we convert `tag` to uppercase since browsers expect it to be uppercase.

```javascript
         var tag = (selector.length === 2 || ! criterium) ? selector [0].toUpperCase () : undefined;
```

We invoke `getElementsByTagName` on `from`; if a specific `tag` is required, we pass it as an argument to this function; otherwise, we pass a wildcard to get all the elements. Now, if `selector.from` was passed, we want only the child elements of `from` to be selected; if `selector.from` is absent, then we'll select elements from all the elements in the document.

The invocation to `getElementsByTagName` returns a NodeList. We convert it to an array of DOM elements with `c.nodeListToArray`. Once we have this array of elements, we iterate them, filtering out those for which the iterating function returns `undefined`. In other words, the function we're about to define (which takes one node at a time), will determine whether the iterated element is selected.

```javascript
         return dale.fil (c.nodeListToArray (from.getElementsByTagName (tag || '*')), undefined, function (node) {
```

If we're selecting elements by `class` and this element's class doesn't match it, we ignore the element. Note we split `node.className` (if it exists) by whitespace into an array of classes, and make sure that the class we're looking for is one of the elements of that array.

```javascript
            if (criterium === 'class' && (node.className || '').split (/\s/).indexOf (teishi.last (selector)) === -1) return;
```

If we're selecting an element by `id` and the element's id doesn't match the id we're looking for, we ignore the element.

```javascript
            if (criterium === 'id'    && node.id !== teishi.last (selector)) return;
```

If we're here, we will return the element since it matches the required criteria.

```javascript
            return node;
```

We close the iteration function and also this block, since there's nothing left to do.

```javascript
         });
      }
```

If we're here, `selector` is an array. This means that `selector` contains logical operations (`and/or/not`). We will start by extracting `operation`, which is the logical operation that is the first element of the `selector` array. We'll also define `output`, an array where we'll collect the matching elements.

```javascript
      var operation = selector.shift (), output = [];
```

We iterate `selector`, which contains a number of selectors that could be themselves arrays, objects or strings. We will stop whenever any of these iterations returns `false`.

The approach we take is to iterate the selectors and apply logical operations onto the `output` set incrementally as we iterate through the selectors.


```
      dale.stop (selector, false, function (v, k) {
```

We do a recursive call to `c.find` passing it the selector we're iterating. We collect the result of the recursive call in a local variable `elements`.

```javascript
         var elements = c.find (v);
```

If the recursive call to `c.find` is `false`, it means the selector is invalid. We set `output` to `false` and return `false`, which will stop the iteration.

```javascript
         if (elements === false) return output = false;
```

If we're on the first selector and the operation is either `and` or `or`, we set `output` to `elements`. This initializes `output`, since before this operation it was empty.

```javascript
         if (k === 0 && operation !== ':not') output = elements;
```

If we're not on the first selector, or we're using the `not` criterium, we apply the logical operation (through `c.setop`) with `output` (the already selected elements) and `elements` (the new elements to be taken into consideration).

```javascript
         else                                 output = c.setop (operation.replace (':', ''), output, elements);
```

We finish iterating the elements.

```javascript
      });
```

If any of the selectors was `false`, `output` will also be `false`. If all the selectors were valid, `output` will contain the selected elements. We return it and close the function.

```javascript
      return output;
   }
```

### DOM functions

We now start with the first of our DOM functions. All the DOM functions internally use the `c` function and the other helper functions we have seen. Let's start with `c.empty`, which deletes all the child elements within the selected elements. This function takes a single argument, a `selector`.

```javascript
   c.empty = function (selector) {
```

We call `c` with `selector` and a function as arguments. This function will be executed for each of the elements that match `selector`.

```javascript
      c (selector, function (element) {
```

For each of the selected elements, we get all its children (and the children of its children) through `getElementsByTagName`.

```javascript
         dale.go (c.nodeListToArray (element.getElementsByTagName ('*')), function (v) {
```

We take each of the child elements and remove it from its parent. If the element has no parent, it means it's already detached and should already be considered as deleted.

```javascript
            if (v.parentNode) v.parentNode.removeChild (v);
```

There's nothing else to do, so we close the iteration function, the invocation to `c` and the function. Note that we don't return any values.

```javascript
         });
      });
   }
```

We now define `c.fill`, which takes `selector` and `html` as arguments.

```javascript
   c.fill = function (selector, html) {
```

If `html` is not a string, the function will print an error message and return `false`.

```javascript
      if (teishi.stop ('c.fill', ['html', html, 'string'])) return false;
```

We invoke `c.empty` to clear out all existing elements from within the elements matched by `selector`.

```javascript
      c.empty (selector);
```

We iterate the elements matched by `selector` (through a call to `c`) and set their `innerHTML` property to `html`.

```javascript
      c (selector, function (element) {
         element.innerHTML = html;
```

There's nothing else to do, so we close the function. Note that we don't return any values.

```javascript
      });
   }
```

We now define `c.place`, a function that takes three arguments: `selector`, `where` and `html`.

```javascript
   c.place = function (selector, where, html) {
```

We make sure that `where` is one of four strings: `beforeBegin|afterBegin|beforeEnd|afterEnd`, and that `html` is a string. If either of these conditions is not fulfilled, we print an error message and return `false`.

```javascript
      if (teishi.stop ('c.place', [
         ['where', where, ['beforeBegin', 'afterBegin', 'beforeEnd', 'afterEnd'], 'oneOf', teishi.test.equal],
         ['html', html, 'string']
      ])) return false;
```

For each of the elements matching `selector`, we apply [insertAdjacentHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML) with `where` and `html` as its arguments.

```javascript
      c (selector, function (element) {
         element.insertAdjacentHTML (where, html);
```

There's nothing else to do, so we close the function. Note that we don't return any values.

```javascript
      });
   }
```

We now define `c.get`, which takes three arguments: `selector`, `attributes` and `css`. The last argument is a flag (presumably boolean), that will determine whether we're referring to CSS attributes or not.

```javascript
   c.get  = function (selector, attributes, css) {
```

If `attributes` is not string, `undefined`, nor an array, we print an error and return `false`.

```javascript
      if (teishi.stop ('c.get', ['attributes', attributes, ['string', 'array', 'undefined'], 'oneOf'])) return false;
```

We define an array `ignoredValues` with attribute values which we will ignore. This is only necessary for iterating style attributes in Internet Explorer 8 and element attributes in Internet Explorer 7 and below.

```javascript
      var ignoredValues = [null, '', false, 0, "false"];
```

We iterate the elements matched by `selector` and apply the following function to each of them. Note that we will return an array containing the output of this function for each of the elements.

```javascript
      return c (selector, function (element) {
```

If `attributes` is not `undefined`, we iterate it - if `attributes` is a string, this will be equivalent to having a single attribute. We will create an object with the attributes and return it.

```javascript
         if (attributes !== undefined) return dale.obj (attributes, function (v) {
```

If the `css` flag is enabled, we'll access `element.style [v]` (which contains the CSS attribute). If the attribute is not present, we will consider it to be `null`.

```javascript
            if (css) return [v, element.style [v] || null];
```

If the `css` flag is disabled, we will instead return the element's attribute (accessed through `getAttribute`).

```javascript
            else     return [v, element.getAttribute (v)];
         });
```

If we're here, `attributes` is `undefined`, which means we want all the element's attributes. If `css` is falsy, we want the actual attributes (as opposed to the style attributes) of the element. We iterate `element.attributes`. Note that we start with a base object with the element's `class` - this is only for the benefit of Internet Explorer 7 and below.

```javascript
         if (! css) return dale.obj (element.attributes, {'class': element ['class']}, function (v, k) {
```

If the attribute is truthy, if its `nodeName` is truthy, and its `nodeValue` is not one of the values we are ignoring, we return them both. Checking whether the attribute is truthy is only necessary in Internet Explorer 7 and below; many browsers, however, require us to check whether `nodeName` is truthy, otherwise `undefined` attributes will be returned.

```javascript
            if (v && v.nodeName && ignoredValues.indexOf (v.nodeValue) === -1) return [v.nodeName, v.nodeValue];
         });
```

If we're here, we want all inline CSS attributes for the element. In all supported browsers except for Internet Explorer 8, `element.style` has a length property that we will use to iterate the style object. In Internet Explorer 8 and below, however, we're forced to iterate all the keys of the object.

```javascript
         return dale.obj (element.style.length ? dale.times (element.style.length, 0) : dale.keys (element.style), function (k) {
```

If `element.style.length` is supported, we simply return the corresponding key and value of the style object.

```javascript
            if (element.style.length) return [element.style [k], element.style [element.style [k]]];
```

For Internet Explorer 8 and below, we return the key and value but only if the value is not one of the `ignoredValues`.

```javascript
            if (ignoredValues.indexOf (element.style [k]) === -1) return [k, element.style [k]];
         });
```

There's nothing else to do, so we close the iterating function, the invocation to `c` and the function itself.

```javascript
      });
   }
```

We now define `c.set`. It is similar to `c.get`, but instead of returning attributes, it sets them. It takes four arguments, `selector`, `attributes`, `css` and `notrigger` - the last two are flags.

```javascript
   c.set  = function (selector, attributes, css, notrigger) {
```

We now validate the input. `attributes` must be an object.

```javascript
      if (teishi.stop ('c.set', [
         ['attributes', attributes, 'object'],
```

Every attribute key must start with a ASCII letter, underscore or colon, and must follow with zero or more of the following:
- A letter.
- An underscore.
- A colon.
- A digit.
- A period.
- A dash.
- Any Unicode character with a code point of 129 (`0080` in hexadecimal) or above - these include all extended ASCII characters (the top half of the set) and every non-ASCII character.

This arcana was kindly provided [by this article](http://razzed.com/2009/01/30/valid-characters-in-attribute-names-in-htmlxml/). The regex below was taken from the article and modified to add the permitted Unicode characters.

```javascript
         [
            ['attribute keys', 'start with an ASCII letter, underscore or colon, and be followed by letters, digits, underscores, colons, periods, dashes, extended ASCII characters, or any non-ASCII characters.'],
            dale.keys (attributes),
            /^[a-zA-Z_:][a-zA-Z_:0-9.\-\u0080-\uffff]*$/,
            'each', teishi.test.match
         ],
```

The attribute values must be either integers, floats, strings or `null`.

```javascript
         ['attribute values', attributes, ['integer', 'float', 'string', 'null'], 'eachOf']
```

If any of these conditions is not met, an error will be printed and the function will return `false`.

```javascript
      ])) return false;
```

For each of the elements that are matched by `selector`, we will invoke the following function.

```javascript
      c (selector, function (element) {
```

For each of the elements, we iterate `attributes`.

```javascript
         dale.go (attributes, function (v, k) {
```

If we're setting a `css` attribute, we set the attribute within `element.style`. Note that if its desired value is `null`, we set the attribute to an empty string.

```javascript
            if       (css)        element.style [k] = v === null ? '' : v;
```

If we're instead setting an HTML attribute, we use either `removeAttribute` or `setAttribute`, depending on whether the desired value is `null` or not.

```javascript
            else if  (v === null) element.removeAttribute (k);
            else                  element.setAttribute    (k, v);
         });
```

If the `element` has an `onchange` event listener, and the `notrigger` flag is *absent*, we invoke the element's `onchange` listener. This means that by default `c.set` will trigger `element.onchange` for those elements that it matches and that have the event handler.

```javascript
         if (element.onchange && ! notrigger) element.onchange ();
```

There's nothing else to do, so we close the function. Note that we don't return any values.

```javascript
      });
   }
```

We now define `c.fire`, the last DOM function. For each matched element, this function creates an event and dispatches it to the element. This function takes two arguments: `selector` and `eventType`.

```javascript
   c.fire = function (selector, eventType) {
```

If `eventType` is not a string, we print an error and return `false`.

```javascript
      if (teishi.stop ('c.fire', ['event type', eventType, 'string'])) return false;
```

For each of the elements that are matched by `selector`, we will invoke the following function.

```javascript
      c (selector, function (element) {
```

We define a local variable `ev` to hold the event we are about to create.

```javascript
         var ev;
```

We first try to create the event using the [Event constructor](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event), which should work for most browsers. Note we pass `eventType` to the constructor so the event is of the desired type.

```javascript
         try {
            ev = new Event (eventType);
         }
```

If the event constructor is not supported, we use either the [`createEvent` method](https://developer.mozilla.org/en-US/docs/Web/API/Event/createEvent) or the [`createEventObject` method](https://msdn.microsoft.com/en-us/ie/ms536390(v=vs.94)). The latter method is only for Internet 8 and below.

```javascript
         catch (error) {
            ev = document.createEvent ? document.createEvent ('Event') : document.createEventObject ();
```

In all browsers that don't support the constructor and aren't Internet Explorer, we invoke the [`initEvent` method](https://developer.mozilla.org/en-US/docs/Web/API/Event/initEvent) and pass to it `eventType`. We pass extra `false` arguments since they're required in old versions of Firefox.

```javascript
            if (document.createEvent) ev.initEvent (eventType, false, false);
         }
```

If the browser supports the [`dispatchEvent` method](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent), (which goes for all the browsers we support except for Internet Explorer 8 and below), we will invoke it, passing the event to it.

```javascript
         if (element.dispatchEvent) return element.dispatchEvent (ev);
```

For Internet Explorer 8 and below, we instead invoke `fireEvent`. Note that we pass both `eventType` and the event itself.

```javascript
         if (element.fireEvent)     return element.fireEvent     (eventType, ev);
```

If the browser supports neither method, we print an error.

```javascript
         return clog ('c.fire error', 'Unfortunately, this browser supports neither EventTarget.dispatchEvent nor element.fireEvent.');
```

There's nothing else to do, so we close the function. Note that we don't return any values.

```javascript
      });
   }
```

### Non-DOM functions

Our first non-DOM function is `c.ready`, which takes a single function that will be run when the [the HTML page, all scripts and all stylesheets have been loaded](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event).

```javascript
   c.ready = function (fun) {
```

If `document.addEventListener` is present (which is the case on most browsers), we'll attach `fun` to it when the `load` event is triggered. We pass a `false` third argument (`useCapture`) because Firefox 5 and Opera 11.5 and below require it.

```javascript
      if (window.addEventListener) return window.addEventListener ('load', fun, false);
```

If we're on Internet Explorer 8 and below, we instead use `window.attachEvent` and bind it to the `onload` event.

```javascript
      if (window.attachEvent)      return window.attachEvent      ('onload', fun);
```

If we're on [very old browsers](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Browser_compatibility) (Safari 6 and below, old versions of Chrome & Firefox for Android), neither of these two methods will be present. Instead, we we will run a function every 10 milliseconds until the document is ready.

Once the document is complete, `fun` will be run and the function running every 10 milliseconds will stop being called.

```javascript
      var interval = setInterval (function () {
         if (document.readyState === 'complete') fun () || clearInterval (interval);
      }, 10);
```

We close the function.

```javascript
   }
```

We define `c.cookie`, a function to read and delete cookies. It takes an optional `cookie` argument.

```javascript
   c.cookie = function (cookie) {
```

If `cookie` is `false`, we will delete all cookies from the client. Note that this only will happen for those cookies within the domain on which the page is being served, since a given domain can only access its own cookies.

```javascript
      if (cookie === false) {
```

We take `document.cookie`, a string which contains all the stored cookies we can access from the current domain. We split it by semicolons, ignoring any whitespace after the semicolons.

```javascript
         return dale.go (document.cookie.split (/;\s*/), function (v) {
```

For each of the cookies, we take the name of the cookie (the text before the `=` sign), overwrite its value with an empty string and then set its `expires` property to the present moment. This will make the browser delete the cookie immediately. The approach was taken from [here](https://stackoverflow.com/a/27374365).

```javascript
            document.cookie = v.replace (/^ +/, '').replace (/=.*/, '=;expires=' + new Date ().toUTCString ())
```

We return the deleted cookie.

```javascript
            return v;
```

We close the loop and the block; all the deleted cookies will be returned inside an array.

```javascript
         });
      }
```

If we're here, we're reading cookies instad of deleting them. If `cookie` is absent, we will read `document.cookie` instead. We split it by semicolons, ignoring any whitespace after the semicolons.

After iterating each cookie we will return an object where each key is the cookie name and each value is the cookie value.

```javascript
      return dale.obj ((cookie || document.cookie).split (/;\s*/), function (v) {
```

If the cookie is empty, we ignore it.

```javascript
         if (v === '') return;
```

We split the cookie by the `=` sign.

```javascript
         v = v.split ('=');
```

We extract the name and the value into variables.

```javascript
         var name = v [0];
         var value = v.slice (1).join ('=');
```

We return `name` as the key and `value` as the value for the cookie. There's nothing else to do, so we close the iteration and the function.

```javascript
         return [name, value];
      });
   }
```

We define now `c.ajax`, a function for performing asynchronous calls, therefore rending web applications (as opposed to mere web pages) truly possible.

This function takes five arguments: `method`, `path`, `headers`, `body` and `callback`.

```javascript
   c.ajax = function (method, path, headers, body, callback) {
```

If `method` is not present, we will set it to `GET`.

```javascript
      method   = method   || 'GET';
```

If `headers` is not present, we will set it to an empty string.

```javascript
      headers  = headers  || {};
```

If `body` is not present, we will set it to an empty string.

```javascript
      body     = body     || '';
```

If `callback` is not present, we will set it to an empty function.

```javascript
      callback = callback || function () {};
```

Notice we don't set `path` to anything if it's absent, since no sensible default can be assumed.

We make sure that `method` and `path` are strings, that `headers` is an object and that `callback` is a function. If any of these conditions is not met, we print an error and return `false`.

```javascript
      if (teishi.stop ('c.ajax', [
         ['method',   method,   'string'],
         ['path',     path,     'string'],
         ['headers',  headers,  'object'],
         ['callback', callback, 'function']
      ])) return false;
```

We initialize the XMLHttpRequest object, which will be present in [most browsers](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Browser_compatibility). In Internet Explorer 5 and 6, `XMLHttpRequest` is absent, but we can use `ActiveXObject` [instead](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest_in_IE6).

```javascript
      var r = window.XMLHttpRequest ? new XMLHttpRequest () : new ActiveXObject ('Microsoft.XMLHTTP');
```

We initialize the request, passing it the uppercased `method`, `path` and a truthy third argument to indicate that we want the request to be asynchronous.

```javascript
      r.open (method.toUpperCase (), path, true);
```

If `body` is not a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/formdata) object and it is instead a plain array or an object, we do two things:

```javascript
      if (teishi.complex (body) && type (body, true) !== 'formdata') {
```

1) Set the `content-type` header to `application/json`, unless it's already present in `headers`.

```javascript
         headers ['content-type'] = headers ['content-type'] || 'application/json';
```

2) We set `body` to its stringified value.

```javascript
         body = teishi.s (body);
      }
```

We set all the `headers` through `setRequestHeader`.

```javascript
      dale.go (headers, function (v, k) {
         r.setRequestHeader (k, v);
      });
```

We set an event handler that will be fired when the request goes from one phase to the next.

```javascript
      r.onreadystatechange = function () {
```

If [readyState](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState) does not equal to 4, the request is not yet complete, so we don't do anything.

```javascript
         if (r.readyState !== 4) return;
```

If the response status is neither 200 nor 304, we consider the request to have failed. In this case, we invoke `callback` with the request as its first argument, to indicate that an error has happened.

```javascript
         if (r.status !== 200 && r.status !== 304) return callback (r);
```

We define a variable `json` that we will use to detect whether the response was of type json.

```javascript
         var json;
```

We define a variable `res` that will hold the response object. We set its `xhr` key to the actual response object.

```javascript
         var res = {
            xhr: r,
```

We take the response headers (which are a string), split them by newlines and build a `headers` object by iterating them. In Firefox 18 and below, the response headers don't contain carriage returns (`\r`), so we make them optional in the regex we pass to `split`. For each header:

```javascript
            headers: dale.obj (r.getAllResponseHeaders ().split (/\r?\n/), function (header) {
```

If header is an empty string, we ignore it.

```javascript
               if (header === '') return;
```

We create two variables: `name`, to hold the name of the header; and `value`, to hold the contents of the header after the name, a colon and one or more whitespace. The `name` will be all the text before the first colon.

```javascript
               var name = header.match (/^[^:]+/) [0], value = header.replace (name, '').replace (/:\s+/, '');
```

If the `content-type` header matches the `application/json` MIME type, we set `json` to `true`.

```javascript
               if (name.match (/^content-type/i) && value.match (/application\/json/i)) json = true;
```

We return `name` and `value` to place them within `headers`. This concludes the iteration. We also close `headers`.

```javascript
               return [name, value];
            })
         };
```

We set `res.body` to the `responseText` property of the request; if the response was JSON, we parse the `responseText`.

```javascript
         res.body = json ? teishi.p (r.responseText) : r.responseText;
```

We invoke `callback` with a `null` first argument and `res` as its second. This concludes the handler.

```javascript
         callback (null, res);
      }
```

We submit the request.

```javascript
      r.send (body);
```

We synchronously return an object with `headers` (the request headers), `body` (the body sent with the request) and `xhr` (the request object itself). This concludes the function.

```javascript
      return {headers: headers, body: body, xhr: r};
   }
```

We define `c.loadScript`, a function that loads an external script. It takes two arguments, `src` (the path to the script) and `callback` (the function that is executed after the operation is complete).

```javascript
   c.loadScript = function (src, callback) {
```

We perform a `GET` request through `c.ajax`, passing `src` as the path.

```javascript
      c.ajax ('get', src, {}, '', function (error, data) {
```

If there was an error, we pass it to `callback`.

```javascript
         if (error) return callback (error);
```

If we're here, the request was successful. We create a `script` element.

```javascript
         var script = document.createElement ('script');
```

We set the text of `script` to the body of the response. We do this within a try/catch block since Internet Explorer 8 and below don't support the first method. The code was adapted from [this snippet](https://stackoverflow.com/a/6433770).

```javascript
         try {
            script.appendChild (document.createTextNode (data.body));
         }
         catch (error) {
            script.text = data.body;
         }
```

We append `script` to the `body`.

```javascript
         document.body.appendChild (script);
```

We invoke `callback` with `null` and `data` as its arguments, to indicate success. There's nothing else to do, so we close the ajax request and the function.

```javascript
         callback (null, data);
      });
   }
```

## License

cocholate is written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.
