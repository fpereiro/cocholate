/*
cocholate - v2.2.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   // *** SETUP ***

   if (typeof exports === 'object') return console.log ('cocholate only works in a browser!');

   var dale   = window.dale;
   var teishi = window.teishi;

   var type = teishi.type, clog = teishi.clog;

   // *** POLYFILL FOR insertAdjacentHTML ***

   if (! document.createElement ('_').insertAdjacentHTML) HTMLElement.prototype.insertAdjacentHTML = function (position, html) {

      var container = document.createElement ('div');
      container.innerHTML = html;

      while (container.firstChild) {
         if      (position === 'beforeBegin') this.parentNode.insertBefore (container.firstChild, this);
         else if (position === 'afterBegin')  this.insertBefore            (container.firstChild, this.firstChild);
         else if (position === 'beforeEnd')   this.appendChild             (container.firstChild);
         else                                 this.parentNode.insertBefore (container.firstChild, this.nextElementSibling)
      }
   }

   // *** CORE ***

   var c = window.c = function (selector, fun) {
      if (teishi.stop ('c', ['fun', fun, ['function', 'undefined'], 'oneOf'])) return false;

      var selectorIsNode = selector && selector.nodeName;

      var elements = selectorIsNode ? [selector] : c.find (selector);
      if (elements === false) return false;

      if (fun) {
         var args = dale.go (arguments, function (v) {return v}).slice (2);
         elements = dale.go (elements, function (v) {
            return fun.apply (undefined, [v].concat (args));
         });
      }

      if (selectorIsNode || (type (selector) === 'string' && selector.match (/^[a-z0-9]*#[^\s\[>,:]+$/))) return elements [0];
      else                                                                                                return elements;
   }

   c.nodeListToArray = function (nodeList) {
      var output = [];
      for (var i = 0; i < nodeList.length; i++) {
         output.push (nodeList [i]);
      }
      return output;
   }

   c.setop = function (operation, set1, set2) {
      if (operation === 'and') return dale.fil (set1, undefined, function (v) {
         return set2.indexOf (v) > -1 ? v : undefined;
      });
      var output = set1.slice ();
      if (operation === 'or') {
         dale.go (set2, function (v) {
            if (output.indexOf (set2) === -1) output.push (v);
         });
      }
      else {
         if (output.length === 0) output = c.nodeListToArray (document.getElementsByTagName ('*'));
         dale.go (set2, function (v) {
            var index = output.indexOf (v);
            if (index > -1) output.splice (index, 1);
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
               ['selector.selector', selector.selector, ['array', 'string'], 'oneOf'],
               function () {
                  if (type (selector.from) !== 'object' || (document.querySelectorAll && ! selector.from.querySelectorAll)) return clog ('teishi.v', 'selector.from passed to cocholate must be a DOM element.');
                  return true;
               }
            ]]
         ]}
      ])) return false;

      if (selectorType !== 'array') {
         if (document.querySelectorAll && selectorType === 'string') return c.nodeListToArray (document.querySelectorAll (selector));
         if (document.querySelectorAll && selectorType === 'object') return c.nodeListToArray (selector.from.querySelectorAll (selector.selector));

         var from = selector.from ? selector.from : document;
         selector = selectorType === 'string' ? selector : selector.selector;
         if (selector !== '*' && ! selector.match (/^[a-z0-9]*(#|\.)?[a-z0-9]+$/i)) return clog ('The selector ' + selector + ' is not supported in IE <= 7 or Firefox <= 3.');

         var criterium = selector.match ('#') ? 'id' : (selector.match (/\./) ? 'class' : undefined);
         selector = selector.split (/#|\./);
         var tag = (selector.length === 2 || ! criterium) ? selector [0].toUpperCase () : undefined;

         return dale.fil (c.nodeListToArray (from.getElementsByTagName (tag || '*')), undefined, function (node) {
            if (criterium === 'class' && (node.className || '').split (/\s/).indexOf (teishi.last (selector)) === -1) return;
            if (criterium === 'id'    && node.id !== teishi.last (selector)) return;
            return node;
         });
      }

      var operation = selector.shift (), output = [];

      dale.stop (selector, false, function (v, k) {
         var elements = c.find (v);
         if (elements === false) return output = false;
         if (k === 0 && operation !== ':not') output = elements;
         else                                 output = c.setop (operation.replace (':', ''), output, elements);
      });
      return output;
   }

   // *** DOM FUNCTIONS ***

   c.empty = function (selector) {
      c (selector, function (element) {
         dale.go (c.nodeListToArray (element.getElementsByTagName ('*')), function (v) {
            if (v.parentNode) v.parentNode.removeChild (v);
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
      if (teishi.stop ('c.get', ['attributes', attributes, ['string', 'array', 'undefined'], 'oneOf'])) return false;
      var ignoredValues = [null, '', false, 0, "false"];

      return c (selector, function (element) {
         if (attributes !== undefined) return dale.obj (attributes, function (v) {
            if (css) return [v, element.style [v] || null];
            else     return [v, element.getAttribute (v)];
         });
         if (! css) return dale.obj (element.attributes, {'class': element ['class']}, function (v, k) {
            if (v && v.nodeName && ignoredValues.indexOf (v.nodeValue) === -1) return [v.nodeName, v.nodeValue];
         });
         return dale.obj (element.style.length ? dale.times (element.style.length, 0) : dale.keys (element.style), function (k) {
            if (element.style.length) return [element.style [k], element.style [element.style [k]]];
            if (ignoredValues.indexOf (element.style [k]) === -1) return [k, element.style [k]];
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
         ['attribute values', attributes, ['integer', 'float', 'string', 'null'], 'eachOf']
      ])) return false;

      c (selector, function (element) {
         dale.go (attributes, function (v, k) {
            if       (css)        element.style [k] = v === null ? '' : v;
            else if  (v === null) element.removeAttribute (k);
            else                  element.setAttribute    (k, v);
         });
         if (element.onchange && ! notrigger) element.onchange ();
      });
   }

   c.fire = function (selector, eventType) {
      if (teishi.stop ('c.fire', ['event type', eventType, 'string'])) return false;
      c (selector, function (element) {
         var ev;
         try {
            ev = new Event (eventType);
         }
         catch (error) {
            ev = document.createEvent ? document.createEvent ('Event') : document.createEventObject ();
            if (document.createEvent) ev.initEvent (eventType, false, false);
         }
         if (element.dispatchEvent) return element.dispatchEvent (ev);
         if (element.fireEvent)     return element.fireEvent     (eventType, ev);
         return clog ('c.fire error', 'Unfortunately, this browser supports neither EventTarget.dispatchEvent nor element.fireEvent.');
      });
   }

   // *** NON-DOM FUNCTIONS ***

   c.ready = function (fun) {
      if (window.addEventListener) return window.addEventListener ('load', fun, false);
      if (window.attachEvent)      return window.attachEvent      ('onload', fun);
      var interval = setInterval (function () {
         if (document.readyState === 'complete') fun () || clearInterval (interval);
      }, 10);
   }

   c.cookie = function (cookie) {
      if (cookie === false) {
         return dale.go (document.cookie.split (/;\s*/), function (v) {
            document.cookie = v.replace (/^ +/, '').replace (/=.*/, '=;expires=' + new Date ().toUTCString ())
            return v;
         });
      }
      return dale.obj ((cookie || document.cookie).split (/;\s*/), function (v) {
         if (v === '') return;
         v = v.split ('=');
         var name = v [0];
         var value = v.slice (1).join ('=');
         return [name, value];
      });
   }

   c.ajax = function (method, path, headers, body, callback) {
      method   = method   || 'GET';
      headers  = headers  || {};
      body     = body     || '';
      callback = callback || function () {};
      if (teishi.stop ('c.ajax', [
         ['method',   method,   'string'],
         ['path',     path,     'string'],
         ['headers',  headers,  'object'],
         ['callback', callback, 'function']
      ])) return false;

      var r = window.XMLHttpRequest ? new XMLHttpRequest () : new ActiveXObject ('Microsoft.XMLHTTP');
      r.open (method.toUpperCase (), path, true);
      if (teishi.complex (body) && type (body, true) !== 'formdata') {
         headers ['content-type'] = headers ['content-type'] || 'application/json';
         body = teishi.s (body);
      }
      dale.go (headers, function (v, k) {
         r.setRequestHeader (k, v);
      });
      r.onreadystatechange = function () {
         if (r.readyState !== 4) return;
         if (r.status !== 200 && r.status !== 304) return callback (r);
         var json;
         var res = {
            xhr: r,
            headers: dale.obj (r.getAllResponseHeaders ().split (/\r?\n/), function (header) {
               if (header === '') return;
               var name = header.match (/^[^:]+/) [0], value = header.replace (name, '').replace (/:\s+/, '');
               if (name.match (/^content-type/i) && value.match (/application\/json/i)) json = true;
               return [name, value];
            })
         };
         res.body = json ? teishi.p (r.responseText) : r.responseText;
         callback (null, res);
      }
      r.send (body);
      return {headers: headers, body: body, xhr: r};
   }

   c.loadScript = function (src, callback) {
      c.ajax ('get', src, {}, '', function (error, data) {
         if (error) return callback (error);
         var script = document.createElement ('script');
         try {
            script.appendChild (document.createTextNode (data.body));
         }
         catch (error) {
            script.text = data.body;
         }
         document.body.appendChild (script);
         callback (null, data);
      });
   }

}) ();
