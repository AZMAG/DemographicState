"use strict";

var request = require("request");
var fs = require("fs");

module.exports = function (grunt, async, options) {
    console.log(options);

    var done = async();
    if (!options) {
        throw new Error("options is undefined");
    }

    var thematicMaps = JSON.parse(fs.readFileSync(options.inputLocation));

    var geostats = require(options.geoStatsPath);
    var series = new geostats();
    var counter = 0;

    function generateClassBreaks(data) {
        for (const thematicMap of thematicMaps) {
            counter++;
            console.log(counter);
            processItem(thematicMap);
        }

        function processItem(thematicMap) {
            if (thematicMap.NodeType === "map") {
                let arr = [];
                if (thematicMap.FieldName) {
                    if (thematicMap.NormalizeField) {
                        arr = data[thematicMap.FieldName].map(function (n, i) {
                            let pushVal = 0;
                            const normVal = data[thematicMap.NormalizeField][i];
                            if (normVal) {
                                pushVal = n / normVal;
                            }
                            return pushVal;
                        });
                    } else {
                        arr = data[thematicMap.FieldName];
                    }

                    series.setSerie(arr);
                    thematicMap["breaks"] = {};
                    for (var i = 3; i <= 9; i++) {
                        thematicMap.breaks[`Jenks${i}`] = series.getClassJenks(
                            i
                        );
                        thematicMap.breaks[
                            `EqInterval${i}`
                        ] = series.getClassEqInterval(i);
                        thematicMap.breaks[
                            `Quantile${i}`
                        ] = series.getClassQuantile(i);
                    }
                }
            } else {
                for (const subsub of thematicMap.items) {
                    processItem(subsub);
                }
            }
        }

        writeToFile();
    }

    function writeToFile() {
        console.log("writing to file");
        fs.writeFileSync(options.outputLocation, JSON.stringify(thematicMaps));
        done();
    }

    var requestUrl = `${options.mainUrl}/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json`;
    request(requestUrl, function (err, res, body) {
        const data = {};
        const features = JSON.parse(body).features;
        console.log(features.length);

        for (var i = 0; i < features.length; i++) {
            const feature = features[i];
            const attr = feature.attributes;

            //setup data obj on first time
            if (i === 0) {
                Object.keys(attr).forEach(function (key) {
                    var val = attr[key];
                    data[key] = [];
                });
            }
            //Loop Through Attributes and add each value to associated dict in data
            Object.keys(attr).forEach(function (key) {
                var val = attr[key];
                if (val) {
                    data[key].push(val);
                } else {
                    data[key].push(0);
                }
            });
        }
        generateClassBreaks(data);
    });
};
