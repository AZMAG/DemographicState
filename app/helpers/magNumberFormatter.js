/**
 * Format numbers according to business rules defined by MAG.
 *
 * @class magNumberFormatter
 */

(function () {
    "use strict";

    define([
        "dojo/number"
    ],

        function (number) {

            var MagNumberFormatter = new function () {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                /**
                 * Convert a number to a formatted string.
                 *
                 * @method formatValue
                 * @param {number} valueToFormat - value to be formatted.
                 * @returns {string} formatted string.
                 */
                self.formatValue = function (valueToFormat) {
                    if(isNaN(valueToFormat)) {
                        return valueToFormat;
                    }
                    else {
                        if(valueToFormat === 0) {
                            return "0";
                        }

                        var strNum = valueToFormat.toString();
                        var decIndx = strNum.indexOf(".");
                        var fixedStrNum = valueToFormat.toFixed(1).toString();

                        if(decIndx === -1) {
                            return number.format(valueToFormat).toString();
                        }
                        else if(decIndx === 0) {
                            return number.format(valueToFormat, {places: 1});
                        }
                        else {
                            var parts = fixedStrNum.split(".");
                            if(valueToFormat < 1 && valueToFormat > -1) {
                                if(parts[1] === "0") {
                                    return "0";
                                }
                                else {
                                    return "." + parts[1];
                                }
                            }
                            else {
                                var wholeWithCommas = number.format(parts[0]);
                                if(wholeWithCommas === 0) {
                                    return "0";
                                }
                                else {
                                    return wholeWithCommas + "." + parts[1];
                                }
                            }
                        }
                    }
                };

                /**
                 * Add thousands commas to a number.
                 *
                 * @method addCommasToNumber
                 * @param {string} strNum - string representation of number.
                 * @returns {string} with commas added.
                 */
                self.addCommasToNumber = function (strNum) {
                    var parr = [],
                        j = strNum.length,
                        m = Math.floor(j / 3),
                        n = strNum.length % 3 || 3;

                    for(var i = 0; i < j; i += n) {
                        if(i !== 0) {n = 3;}
                        parr.push(strNum.substr(i, n));
                        m -= 1;
                    }

                    return parr.join(",");
                };
            };

            return MagNumberFormatter;

        });
} ());