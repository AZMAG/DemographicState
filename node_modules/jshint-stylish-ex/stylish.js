'use strict';
var chalk = require('chalk');
var table = require('text-table');
var extend = require('util-extend');
var fs = require('fs');
var path = require('path');

module.exports = {
	reporter: function (result, config, options) {
		var total = result.length;
		var ret = '';
		var headers = [];
		var prevfile;

		options = options || {};
		
		var colors = {};
		if(fs.existsSync(path.resolve('.stylishcolors'))) {
			var rc = fs.readFileSync('.stylishcolors', { encoding: 'utf8' });
			colors = JSON.parse(rc);
		}
			
		colors = extend({
			'meta': 'gray',
			'reason': 'blue',
			'verbose': 'gray',
			'error': 'red',
			'noproblem': 'green'
		}, colors);

		ret += table(result.map(function (el, i) {
			var err = el.error;
			var line = [
				'',
				chalk[colors.meta]('line ' + err.line),
				chalk[colors.meta]('col ' + err.character),
				chalk[colors.reason](err.reason)
			];

			if (el.file !== prevfile) {
				headers[i] = el.file;
			}

			if (options.verbose) {
				line.push(chalk[colors.verbose]('(' + err.code + ')'));
			}

			prevfile = el.file;

			return line;
		})).split('\n').map(function (el, i) {
			return headers[i] ? '\n' + chalk.underline(headers[i]) + '\n' + el : el;
		}).join('\n') + '\n\n';

		if (total > 0) {
			ret += chalk[colors.error].bold('✖ ' + total + ' problem' + (total === 1 ? '' : 's'));
		} else {
			ret += chalk[colors.noproblem].bold('✔ No problems');
			ret = '\n' + ret.trim();
		}

		console.log(ret + '\n');
	}
};
