/*
cocholate - v1.4.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source (but not yet!).
*/

(function () {

   // *** SETUP ***

   if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');

   var dale   = window.dale;
   var teishi = window.teishi;

   var type   = teishi.t;

   // *** CORE ***

   var c = window.c = function (selector, fun) {
      if (teishi.stop ('c', ['fun', fun, ['function', 'undefined'], 'oneOf'])) return false;

      var elements = c.find (selector);
      if (elements === false) return false;

      if (fun) {
         var args = teishi.c (arguments).slice (2);
         elements = dale.do (elements, function (v) {
            return fun.apply (undefined, [v].concat (args));
         });
      }

      if (type (selector) === 'string' && selector.match (/^[a-z]*#[^\s\[>,:]+$/)) return elements [0];
      else                                                                         return elements;
   }

   c.nodeListToArray = function (nodeList) {
      // https://davidwalsh.name/nodelist-array
      return [].slice.call (nodeList);
   }

   c.setop = function (operation, set1, set2) {
      if (operation === 'and') return dale.fil (set1, undefined, function (v) {
         return set2.indexOf (v) !== -1 ? v : undefined;
      });
      var output = set1.slice ();
      if (operation === 'or') {
         dale.do (set2, function (v) {
            if (output.indexOf (set2) === -1) output.push (v);
         });
      }
      else {
         if (output.length === 0) output = c.nodeListToArray (document.getElementsByTagName ('*'));
         dale.do (set2, function (v) {
            var index = output.indexOf (v);
            if (index !== -1) output.splice (index, 1);
         });
      }
      return output;
   }

   c.find = function (selector) {

      var selectorType = type (selector);

      if (teishi.stop ('cocholate', [
         ['selector', selector, ['array', 'string', 'object'], 'oneOf'],
         function () {return [
            [selectorType === 'array',  ['first element of array selector', selector [0], [':and', ':or', ':not'], 'oneOf', teishi.test.equal]],
            [selectorType === 'object', [
               ['selector keys', dale.keys (selector), ['selector', 'from'], 'eachOf', teishi.test.equal],
               ['valid HTML node', selector.from, 'undefined', teishi.test.notEqual],
               function () {return [['from.querySelectorAll', 'valid HTML node'], selector.from.querySelectorAll, 'function']}
            ]]
         ]}
      ])) return false;

      if (selectorType === 'string') return c.nodeListToArray (document.querySelectorAll (selector));
      if (selectorType === 'object') return c.nodeListToArray (selector.from.querySelectorAll (selector.selector));

      var operation = selector.shift ();
      var output = [];

      dale.stop (selector, false, function (v, k) {
         var elements = c.find (v);
         if (elements === false) return output = false;
         if (k === 0 && operation !== ':not') output = elements;
         else                                 output = c.setop (operation.replace (':', ''), output, elements);
      });
      return output;
   }

   // *** DOM OPERATIONS ***

   c.empty = function (selector) {
      c (selector, function (element) {
         dale.do (c.nodeListToArray (element.getElementsByTagName ('*')), function (v) {
            v.remove ();
         });
      });
   }

   c.fill = function (selector, html) {
      if (teishi.stop ('c.fill', ['html', html, 'string'])) return false;

      c.empty (selector);
      c (selector, function (element) {
         element.innerHTML = html;
      });
   }

   c.place = function (selector, where, html) {
      if (teishi.stop ('c.place', [
         ['where', where, ['beforeBegin', 'afterBegin', 'beforeEnd', 'afterEnd'], 'oneOf', teishi.test.equal],
         ['html', html, 'string']
      ])) return false;

      c (selector, function (element) {
         element.insertAdjacentHTML (where, html);
      });
   }

   c.get  = function (selector, attributes, css) {
      if (teishi.stop ('c.get', ['attributes', attributes, ['string', 'array'], 'oneOf'])) return false;

      return c (selector, function (element) {
         return dale.obj (attributes, function (v) {
            if (css) return [v, element.style [v] || null];
            else     return [v, element.getAttribute (v)];
         });
      });
   }

   c.set  = function (selector, attributes, css, notrigger) {
      if (teishi.stop ('c.set', [
         ['attributes', attributes, 'object'],
         [
            ['attribute keys', 'start with an ASCII letter, underscore or colon, and be followed by letters, digits, underscores, colons, periods, dashes, extended ASCII characters, or any non-ASCII characters.'],
            dale.keys (attributes),
            /^[a-zA-Z_:][a-zA-Z_:0-9.\-\u0080-\uffff]*$/,
            'each', teishi.test.match
         ],
         ['attribute values', attributes, ['integer', 'string', 'null'], 'eachOf']
      ])) return false;

      c (selector, function (element) {
         dale.do (attributes, function (v, k) {
            if       (css)        element.style [k] = v === null ? '' : v;
            else if  (v === null) element.removeAttribute (k);
            else                  element.setAttribute    (k, v);
         });
         if (element.onchange && ! notrigger) element.onchange ();
      });
   }

   // *** NON-DOM OPERATIONS ***

   c.ready = function (fun) {
      if (document.addEventListener) return document.addEventListener ('DOMContentLoaded', fun);
      // http://stackoverflow.com/questions/799981/document-ready-equivalent-without-jquery
      if (document.attachEvent) {
         document.attachEvent ('onreadystatechange', function () {
            if (document.readyState === 'complete') fun ();
         });
      }
      else fun ();
   }

   c.cookie = function (cookie) {
      return dale.obj ((cookie || document.cookie).split (/;\s+/), function (v) {
         if (v === '') return;
         v = v.split ('=');
         var name = v [0];
         var value = v.slice (1).join ('=');
         return [name, value];
      });
   }

   c.ajax = function (method, path, body, headers, callback) {
      method   = method   || 'GET';
      body     = body     || '';
      headers  = headers  || {};
      callback = callback || function () {};
      if (teishi.stop ('c.ajax', [
         ['method',   method,   'string'],
         ['path',     path,     'string'],
         ['headers',  headers,  'object'],
         ['callback', callback, 'function']
      ])) return false;

      var r = new XMLHttpRequest ();
      r.open (method.toUpperCase (), path, true);
      if (teishi.complex (body) && teishi.t (body, true) !== 'formdata') {
         headers ['content-type'] = headers ['content-type'] || 'application/json';
         body = teishi.s (body);
      }
      dale.do (headers, function (v, k) {
         r.setRequestHeader (k, v);
      });
      r.onreadystatechange = function () {
         if (r.readyState !== 4) return;
         if (r.status !== 200) callback (r);
         else                  callback (null, r);
      }
      r.send (body);
      return {headers: headers, body: body};
   }

   // *** POLYFILL ***

   c.polyfill = function () {

      var newElement = function () {
         return document.createElement ('_');
      }

      // https://gist.github.com/eligrey/1276030
      if (! newElement ().insertAdjacentHTML) {

         HTMLElement.prototype.insertAdjacentHTML = function (position, html) {

            var This = this, container = newElement (), Parent = This.parentNode, node, firstChild, nextSibling;

            container.innerHTML = html;

            if      (position === 'beforeBegin') {
               while (node = container.firstChild) Parent.insertBefore (node, This);
            }
            else if (position === 'afterBegin') {
               firstChild = This.firstChild;
               while (node = container.lastChild)  This.insertBefore (node, firstChild);
            }
            else if (position === 'beforeEnd') {
               while (node = container.firstChild) This.appendChild (node);
            }
            else {
               nextSibling = This.nextSibling;
               while (node = container.lastChild)  Parent.insertBefore (node, nextSibling)
            }
         }
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
      if (! Element.prototype.remove) {
         Element.prototype.remove = function () {
            if (this.parentNode) this.parentNode.removeChild (this);
         }
      }

      if (! Array.prototype.indexOf) {
         Array.prototype.indexOf = function (element, from) {
            var result = dale.stopNot (from ? this.slice (from) : this, undefined, function (v, k) {
               if (element === v) return k;
            });
            return result === undefined ? -1 : result;
         }
      }
   }

   c.polyfill ();

}) ();
