# cocholate

> "Why cocholate? Because it goes well with [vanilla](http://vanilla-js.com)." -- cocholate's PR.

cocholate is a small library for DOM manipulation. It's meant to be small, easily understandable and fast.

## Current status of the project

The current version of cocholate, v1.2.0, is considered to be *unstable* and *incomplete*. [Suggestions](https://github.com/fpereiro/cocholate/issues) and [patches](https://github.com/fpereiro/cocholate/pulls) are welcome. Future changes planned are:

- Improve the readme and add annotated source code.
- Test the library in older browsers and improve the polyfill.

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

Or you can use these links to use the latest version - courtesy of [RawGit](https://rawgit.com) and [MaxCDN](https://maxcdn.com).

```html
<script src="https://cdn.rawgit.com/fpereiro/dale/1bb6973037dd409f667231d51c55845672d19821/dale.js"></script>
<script src="https://cdn.rawgit.com/fpereiro/teishi/984e9295f7ef31cd04576b8f9ac015e1953aabc1/teishi.js"></script>
<script src="https://cdn.rawgit.com/fpereiro/cocholate/ed9ac0f2099cdc15b7b406d3e38a53d55ccef303/cocholate.js"></script>
```

cocholate is exclusively a client-side library. Still, you can find it in npm: `npm install cocholate`

## Loading cocholate

As soon as you include cocholate, it will be available on `window.c`.

```javascript
var c = window.c ();
```

cocholate automatically executes its own polyfill (available at `c.polyfill`). If you want to override it, you can simply load your own polyfill before loading cocholate.

For the rest of the readme we'll assume that you created your instance of cocholate and named it `c`.

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

`c.empty` [removes](https://www.tutorialspoint.com/prototype/prototype_element_remove.htm) all the DOM elements within the elements matched by the selector. In other words, it completely gets rid of all the DOM elements nested inside of the matching elements. This function has no meaningful return value.

### `c.fill`

`c.fill` takes `html` (an HTML string) as its second argument, and first empties the element and then fills it with the provided HTML string. This function has no meaningful return value.

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

`c.get` is useful for fetching attributes from elements. It takes `attributes` as its second argument (which can be either a string or an array of strings, each of them representing an attribute name) and an optional boolean third parameter `css` which marks whether you want to get CSS properties instead of DOM ones.

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

## Non-DOM functions

Besides the five functions for DOM manipulation, there are three more for a few things that are convenient to have around.

### `c.ready`

A function that gets executed when the DOM has finished loading. It has its own polyfill. Takes a single argument, `fun`, containing the code to be executed when this event happens.

### `c.cookie`

Quick & dirty cookie parsing. Takes an optional argument, `cookie`, a cookie string that will be parsed. If you don't pass any arguments, this function will read the cookie at `document.cookie` instead.

This function returns an object with keys/values, each of them pertaining to a property of the cookie.

### `c.ajax`

This function can make ajax calls and provides a few conveniences.

It takes five arguments:

- `method`: a string. Defaults to `'GET'` if you pass a falsy argument.
- `path`: a string with the target path.
- `body`: the body of the request. Defaults to `''` if you pass a falsy argument.
- `headers`: an object where every value is a string. Defaults to `{}` if you pass a falsy argument.
- `callback`: a function to be executed after the request is completed. Defaults to an empty function if you pass a falsy argument.

The conveniences provided are:

- You can directly pass a [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object, useful for `multipart/form-data` requests.
- If you pass an array or object as `body`, the `content-type` header will be automatically set to `application/json` and the body will be stringified.
- All ajax requests done through this function are asynchronous.
- The function will synchronously return an object of the form `{headers: ..., body: ...}`.
- The callback will unconditinally receive the request itself as its first argument. This request contains all the relevant information, including payloads and errors.

## Source code

The complete source code is contained in `cocholate.js`. It is about 260 lines long.

Annotated source code will be forthcoming when the library stabilizes.

## License

cocholate is written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.
