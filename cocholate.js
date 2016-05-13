/*
cocholate - v0.3.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   // *** SETUP ***

   if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');

   var dale   = window.dale;
   var teishi = window.teishi;

   var type   = teishi.t;

   (function polyfill () {

      var createContainer = function () {
         return document.createElement ('_');
      }

      // https://gist.github.com/eligrey/1276030
      if (! createContainer ().insertAdjacentHTML) {

         HTMLElement.prototype.insertAdjacentHTML = function (position, html) {

            var This = this, container = createContainer (), Parent = This.parentNode, node, firstChild, nextSibling;

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

   }) ();

   var c = window.c = function (selector, fun) {
      if (teishi.stop ('c', ['fun', fun, ['function', 'undefined'], 'oneOf'])) return false;
      var elements = c.find (selector);
      if (elements === false) return false;
      if (! fun) return type (selector) === 'string' && selector [0] === '#' ? elements [0] : elements;
      var Arguments = teishi.c (arguments).slice (2);
      return dale.do (elements, function (v) {
         return fun.apply (undefined, [v].concat (Arguments));
      });
   }

   c.nodeListToArray = function (nodeList) {
      var length = nodeList.length, i = 0, output = [];
      while (i < length) {
         output [i] = nodeList [i++];
      }
      return output;
   }

   // *** DOM OPERATIONS ***

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
         if (output.length === 0) output = dale.do (c.nodeListToArray (document.getElementsByTagName ('*')), function (v) {return v});
         dale.do (set2, function (v) {
            var index = output.indexOf (v);
            if (index !== -1) output.splice (index, 1);
         });
      }
      return output;
   }

   c.find = function (selector) {

      var selectorType = type (selector);
      if (selectorType === 'string') return c.nodeListToArray (document.querySelectorAll (selector));

      if (teishi.stop ('cocholate', [
         ['selector type', selectorType, ['array', 'object'], 'oneOf', teishi.test.equal],
         [selectorType === 'object', ['keys of selector', dale.keys (selector), ['or', 'not'], 'eachOf', teishi.test.equal]]
      ])) return false;

      var output = [];
      dale.stop (selector, false, function (v, k) {
         var element = c.find (v);
         if (element === false) return output = false;
         output = c.setop (selectorType === 'array' ? 'and' : k, output, element);
      });
      return output;
   }

   c.empty = function (selector) {
      c (selector, function (element) {
         dale.do (c.nodeListToArray (element.getElementsByTagName ('*')), function (v) {
            v.remove ();
         });
      });
   }

   c.fill = function (selector, html) {
      c.empty (selector);
      c (selector, function (element) {
         element.innerHTML = html;
      });
   }

   c.get  = function (selector, attributes, css) {
      if (teishi.stop ('c.get', ['attributes', attributes, ['string', 'array'], 'oneOf'])) return false;

      return c (selector, function (element) {
         return dale.obj (attributes, function (v) {
            if (css) return [v, element.style [v]];
            else     return [v, element.getAttribute (v)];
         });
      });
   }

   c.set  = function (selector, attributes, css) {
      if (teishi.stop ('c.set', [
         ['attributes', attributes, 'object'],
         ['attribute values', attributes, ['integer', 'string', 'null'], 'eachOf']
      ])) return false;

      c (selector, function (element) {
         dale.do (attributes, function (v, k) {
            if       (css)        element.style [k] = v === null ? '' : v;
            else if  (v === null) element.removeAttribute (k);
            else                  element.setAttribute    (k, v);
         });
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

   // *** NON-DOM OPERATIONS ***

   c.cookie = function () {
      return dale.obj (document.cookie.split (/;\s+/), function (v) {
         if (v === '') return;
         v = v.split ('=');
         var name = v [0];
         var value = v.slice (1).join ('=');
         return [name, value];
      });
   }

   c.ajax = function (method, path, body, headers, callback) {
      headers = headers || {};
      callback = callback || function () {};
      var r = new XMLHttpRequest ();
      r.open (method.toUpperCase (), path, true);
      if (teishi.complex (body)) {
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
   }

}) ();
