//This file should include miscellaneous repeatable functions used in multiple places in the code.

Number.prototype.MagFormat = function () {
    return this.toFixed(1);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

app.congressDistrictPopup = function (googleCivic) {
    console.log(app.view.popup, googleCivic);

    let selectedValue = app.view.popup.selectedFeature.attributes[googleCivic.valueField].replace(/^0+/, '');
    // console.log(selectedValue);

    GetRepresentativeInfo(googleCivic.id + selectedValue).then((data) => {
        console.log(data);
    })
    return 'test';
    // ocd-division/country:us/state:az/place:peoria

}

const representativeCache = {};
async function GetRepresentativeInfo(id) {
    let url = `https://content.googleapis.com/civicinfo/v2/representatives/ocd-division%2Fcountry%3Aus%2Fstate%3Aaz%2F${encodeURIComponent(id)}?recursive=false&key=${app.config.googleCivicInfoApiKey}`;
    if (representativeCache[id]) {
        return representativeCache[id];
    }
    return new Promise(function (resolve, reject) {
        $.get(url, function (data) {
            representativeCache[id] = data;
            resolve(data);
        })
    })
}

app.AddHighlightGraphic = function (graphic) {

    console.log(graphic);


    let gfxLayer = app.map.findLayerById("gfxLayer");

    if (gfxLayer.graphics && gfxLayer.graphics.items.length > 0) {} else {
        gfxLayer.removeAll();

        var tempGraphic = $.extend({}, graphic);

        tempGraphic.symbol = {
            type: "simple-fill",
            color: [0, 255, 255, .5],
            opacity: .5,
            outline: {
                color: "cyan",
                width: "3"
            }
        };

        gfxLayer.add(tempGraphic);

        //Zoom to highlighted graphic, but expand to give some context.
        app.view.goTo(graphic.geometry.extent.expand(1.5));
    }

}
