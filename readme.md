# cocholate

> "Why cocholate? Because it goes well with [vanilla](http://vanilla-js.com)." -- cocholate's PR.

cocholate is a small library for DOM manipulation. It assumes that you either will use it in modern browsers or with a polyfill. It's meant to be small, easily understandable and fast.

cocholate is very much a work in progress. Feedback is very welcome (fpereiro@gmail.com).

## In lieu of readme

selector:
   - string: CSS selector (`#` for id, `.` for class, by tagname, `[attribute]`, `[attribute="value"]`, or any other valid CSS selector)
   - array (representing AND), every value a selector (string or otherwise)
   - object (representing OR and/or NOT, depending on the keys), every value a selector

array selector: ANDs all possibilities, which means that takes all intersections.
object selector: can contain at most two keys, `or`, `not`. The values of these keys must be selectors.

operators are processed in the order they are read!
