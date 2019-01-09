//This file should include miscellaneous repeatable functions used in multiple places in the code.

Number.prototype.MagFormat = function() {
    return this.toFixed(1);
};

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

app.googleCivicData = function(googleCivic) {
    let selectedValue = app.view.popup.selectedFeature.attributes['googleID'];

    GetRepresentativeInfo(googleCivic.id + selectedValue).then(data => {
        console.log(data);
    });
    return 'test';
};

const representativeCache = {};
async function GetRepresentativeInfo(id) {
    let url = `https://content.googleapis.com/civicinfo/v2/representatives/${encodeURIComponent(
        id
    )}?recursive=false&key=${app.config.googleCivicInfoApiKey}`;
    if (representativeCache[id]) {
        return representativeCache[id];
    }
    return new Promise(function(resolve, reject) {
        $.get(url, function(data) {
            representativeCache[id] = data;
            resolve(data);
        });
    });
}

app.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

app.chartTooltip = function(value, category) {
    return `${app.numberWithCommas(value)} <br> ${category}`;
};

app.valueAxisTemplate = function(value) {
    return app.numberWithCommas(value);
};

app.wrapText = function(value) {
    var wrapLength = 12;
    var returnLabel = '';
    var lineLength = 0;

    if (value.length >= wrapLength) {
        var wordsList = value.split(' ');
        $.each(wordsList, function(index, word) {
            var separator = ' ';
            if (lineLength >= wrapLength) {
                separator = '\n';
                lineLength = 0;
            }
            returnLabel += separator + word;
            lineLength += word.length;
        });
    } else {
        returnLabel = value;
    }
    return returnLabel;
};

app.showInThousands = function(value) {
    console.log(value);
};

app.AddHighlightGraphics = function(features) {
    require(['esri/Graphic'], function(Graphic) {
        let gfx = [];
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            let g = new Graphic({
                geometry: feature.geometry,
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    opacity: 0.5,
                    outline: {
                        color: 'cyan',
                        width: '3'
                    }
                }
            });
            gfx.push(g);
        }
        let gfxLayer = app.map.findLayerById('gfxLayer');
        gfxLayer.addMany(gfx);
    });
};

app.AddHighlightGraphic = function(graphic) {
    let gfxLayer = app.map.findLayerById('gfxLayer');
    console.log(graphic);

    if (gfxLayer.graphics && gfxLayer.graphics.items.length > 0) {
        console.log('asdf');
    } else {
        // gfxLayer.removeAll();

        var tempGraphic = $.extend({}, graphic);

        tempGraphic.symbol = {
            type: 'simple-fill',
            color: [0, 255, 255, 0.5],
            opacity: 0.5,
            outline: {
                color: 'cyan',
                width: '3'
            }
        };
        console.log(tempGraphic);

        gfxLayer.add(tempGraphic);

        //Zoom to highlighted graphic, but expand to give some context.
        // app.view.goTo(graphic.geometry.extent.expand(1.5));
    }
};
