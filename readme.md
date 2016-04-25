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
<script src="https://cdn.rawgit.com/fpereiro/dale/81569fa1077d7641a216d987a7a95a7251c62b68/dale.js"></script>
<script src="https://cdn.rawgit.com/fpereiro/teishi/aa2e4d64f71e1e93745e69ba99f1b71dc3eb8742/teishi.js"></script>
<script src="https://cdn.rawgit.com/fpereiro/cocholate/af0ec5f6a50d9227d1657f6ad1a643bb6781cf3c/cocholate.js"></script>
```

cocholate is an client-side library exclusively. Still, you can find it in npm: `npm install cocholate`

## License

cocholate is written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.
