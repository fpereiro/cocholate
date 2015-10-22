/*
cocholate - v0.1.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');

   var dale   = window.dale;
   var teishi = window.teishi;

   var c = window.c = function (selector, fun) {
      if (teishi.stop ('c', ['fun', fun, 'function'])) return false;
      var elements = c.find (selector);
      if (elements === false) return false;
      var Arguments = teishi.c (arguments).slice (2);
      var output = dale.do (elements, function (v) {
         return fun.apply (undefined, [v].concat (Arguments));
      });
      return output.length > 1 ? output : output [0];
   }

   /*

      selector:
         - string
         - array (representing AND)
         - object (representing OR and/or NOT, depending on the keys)

      string selector:
         - by id (starts with `#`)
         - by class (starts with `.`)
         - by attribute name (starts with attribute name, ends with `=`)
         - by attribute value (starts with `=`, ends with attribute value)
         - by both attribute name and attribute value (divided by `=`)
         - by tag name (must be valid HTML5 tag)

      array selector: ANDs all possibilities, which means that takes all intersections.
      object selector: can contain at most two different keys, `OR` and `NOT`. The values of these keys can be a selector.

   */

   c.find = function (selector, fun) {

      var validate = function (selector, fun) {
         var type = teishi.t (selector);
         var keys = dale.keys (selector);

         if (teishi.stop ('c.get', [
            ['selector', type, ['string', 'array', 'object'], 'oneOf', teishi.test.equal],
            [type === 'string' && selector [0] !== '#' && selector [0] !== '.' && selector [0] !== '=' && selector [selector.length - 1] !== '=',
               ['tag selector', selector, ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'], 'oneOf', teishi.test.equal]
            ],
            [type === 'object', [
               ['number of keys of selector', keys, {min: 0, max: 3}, teishi.test.range],
               ['keys of selector', keys, ['or', 'not', 'in'], 'eachOf', teishi.test.equal],
               [keys [1] !== undefined, [['second key of selector', 'first key of selector'], keys [1], keys [0], teishi.test.notEqual]],
               [keys [2] !== undefined, [['third key of selector', 'second key of selector'], keys [2], keys [1], teishi.test.notEqual]],
            ]],
            ['fun', fun, ['function', 'undefined'], 'oneOf']
         ])) return false;
         return type;
      }

      var all = document.getElementsByTagName ('*');

      var type = validate (selector, fun);
      if (type === false) return false;

      var stringSelector = function (selector) {
         var output = [];
         if      (selector [0] === '#') output = output.concat (document.getElementById    (selector.slice (1)));
         else if (selector [0] === '.') output = output.concat (document.getElementByClass (selector.slice (1)));
         else if (selector [0] === '=') dale.do (all, function (v) {
            if (dale.stopOn (v.attributes, true, function (v) {
               return selector.slice (1) === v;
            })) output.push (v);
         });
         else if (selector [selector.length - 1] === '=') output = output.concat (document.querySelectorAll ('[' + selector.slice (0, -1) + ']'));
         else if (selector.match ('=')) output = output.concat (document.querySelectorAll ('[' + selector.split ('=') [0] + '=' + selector.split ('=') [1] + ']'))
         else output = output.concat (document.getElementsByTagName (selector));
         return output;
      }

      // (and) [...] take first. if zero, it's zero, return. if not, for each iterate until either there or pull and if zero, stop.
      // {or: []} take first, add all that match. then, for next, get the thing, iterate over all and add those that are not there.
      // not: first takes all elements, then substracts those that match
      // non-commutative necessarily, operators are processed as they are read!

      var setop = function (operation, set1, set2) {
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
            if (output.length === 0) output = all;
            dale.do (set2, function (v, k) {
               var index = output.indexOf (set2);
               if (index !== -1) delete output [index];
            });
         }
         return output;
      }

      if (type === 'string') return stringSelector (selector);

      var output = [];
      dale.stopOn (selector, false, function (v, k) {
         var keytype = teishi.t (k);
         var element = c.find (v);
         if (element === false) return output = false;
         if (k === 'in') element = element.getElementsByTagName ('*');
         else output = setop (keytype === 'integer' || k === 'in' ? 'and' : k, output, element);
      });
      return output;
   }

   c.empty = function (selector) {
      c (selector, function (element) {
         if (! element) return;
         dale.do (element.getElementsByTagName ('*'), function (v) {v.remove ();});
      });
   }

   c.write = function (selector, html) {
      c.empty (selector);
      c (selector, function (element) {
         if (! element) return;
         element.innerHTML = html;
      });
   }

   c.get   = function (selector, attributes) {
      c (selector, function (element, attributes) {
         if (teishi.stop ('c.get', ['attributes', attributes, 'object'])) return false;
         return dale.obj (attributes, function (v, k) {
            return [k, element.attributes [v]];
         });
      });
   }

   c.set  = function (selector, attributes) {
      c (selector, function (element, attributes) {
         if (teishi.stop ('c.set', ['attributes', attributes, 'object'])) return false;
         dale.do (attributes, function (v, k) {
            element.attributes [k] = v;
         });
      });
   }

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

   c.change = function (evalString, attributes) {
      return dale.obj (['onchange', 'onkeydown', 'onkeyup'], attributes || {}, function (v) {
         return [v, evalString];
      });
   }

}) ();
