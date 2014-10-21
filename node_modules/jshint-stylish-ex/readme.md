# jshint-stylish [![Build Status](https://secure.travis-ci.org/karl-sjogren/jshint-stylish-ex.png?branch=master)](http://travis-ci.org/sindresorhus/jshint-stylish)

> Stylish reporter for [JSHint](https://github.com/jshint/jshint)

![screenshot](screenshot.png)

Compared to the default reporter:

![default reporter](screenshot-default-formatter.png)


## Install

Install with [npm](https://npmjs.org/package/jshint-stylish): `npm install --save-dev jshint-stylish-ex`


## Getting started

Use it with:

#### JSHint CLI

```
jshint --reporter node_modules/jshint-stylish-ex/stylish.js file.js
```

#### [grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint)

```js
grunt.initConfig({
	jshint: {
		options: {
			reporter: require('jshint-stylish-ex')
		},
		target: ['file.js']
	}
});

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.registerTask('default', ['jshint']);
```

## Configuring colors

In this ex edition you can put an optional `.stylishcolors`-file in the root of your project to modify the output colors of the reporter.

```js
{
    "meta": "gray",
    "reason": "blue",
    "verbose": "gray",
    "error": "red",
    "noproblem": "green"
}
```

The colors available are those from [chalk](https://github.com/sindresorhus/chalk), specificly `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white` and `gray`. There is no support for backgroundcolors or chaning underlines etc.

## License

MIT © [Sindre Sorhus](http://sindresorhus.com), ex-edition by Karl-Johan Sjögren
