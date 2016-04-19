/*
cocholate - v0.2.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   // *** SETUP ***

   if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');

   var dale   = window.dale;
   var teishi = window.teishi;

   var type   = teishi.t;

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
         if (output.length === 0) output = dale.do (document.getElementsByTagName ('*'), function (v) {return v});
         dale.do (set2, function (v) {
            var index = output.indexOf (v);
            if (index !== -1) output.splice (index, 1);
         });
      }
      return output;
   }

   c.find = function (selector) {

      var selectorType = type (selector);
      if (selectorType === 'string') return document.querySelectorAll (selector);

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
         dale.do (element.getElementsByTagName ('*'), function (v) {v.remove ();});
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
