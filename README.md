# KofiLoop

Fast and powered loops under caffeine.

![](https://raw.githubusercontent.com/Norech/KofiLoop/master/resources/img/carbon.png)

## Getting Started

### Installation

Install via NPM:

```bash
$ npm install kofiloop
```



### How to use

Add this at the top of your module's file:

```js
var kofiloop = require('kofiloop');
```

or this if you're using TypeScript or another ES6 preprocessor:

```typescript
import * as kofiloop from 'kofiloop';
```



After that, you will be able to create your first loop:

```js
// We starts the loop every 1000ms (= 1 second).
kofiloop.startLoop(function(){
    console.log("Looped " + this.step + " times");
}, 1000)

// When the loop looped 100 times, we stop it.
.on('step-100', function(loop) {
    loop.stop();
})

// When the loop ends, we log.
.end(function(){
	console.log("The loop is stopped.");    
});
```



## Documentation

The documentation is available at [kofiloop.js.org](https://kofiloop.js.org/).




## Built With

- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript.
- [TypeDoc](http://typedoc.org/) - A documentation generator for TypeScript projects.



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details