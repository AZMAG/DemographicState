//This file should include miscellaneous repeatable functions used in multiple places in the code.

Number.prototype.MagFormat = function () {
    return this.toFixed(1);
};

function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
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
    return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const representativeCache = {};
async function GetRepresentativeInfo(id) {
    if (representativeCache[id]) {
        return new Promise(function (resolve, reject) {
            resolve(representativeCache[id]);
        })
    }
    let url = `https://content.googleapis.com/civicinfo/v2/representatives/${encodeURIComponent(
        id
    )}?recursive=false&key=${app.config.googleCivicInfoApiKey}`;
    return new Promise(function (resolve, reject) {
        $.get(url, function (data) {
            representativeCache[id] = data;
            resolve(data);
        }).fail(function (err) {
            reject(err);
        });
    });
}

app.clearDrawnGraphics = function () {
    let gfxLayer = app.map.findLayerById('gfxLayer');
    gfxLayer.removeAll();
    app.view.graphics.removeAll();
};

app.numberWithCommas = function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

app.chartTooltip = function (value, category) {
    return `${app.numberWithCommas(value)} <r> ${category}`;
};

app.valueAxisTemplate = function (value) {
    return app.numberWithCommas(value);
};

app.wrapText = function (value) {
    var wrapLength = 12;
    var returnLabel = '';
    var lineLength = 0;

    if (value.length >= wrapLength) {
        var wordsList = value.split(' ');
        $.each(wordsList, function (index, word) {
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

app.showInThousands = function (value) {
    console.log(value);
};

app.AddHighlightGraphics = function (features, zoomTo) {
    require(['esri/Graphic'], function (Graphic) {
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

        if (zoomTo) {
            app.view.goTo(gfx);
        }
    });
};

app.AddHighlightGraphic = function (graphic) {
    let gfxLayer = app.map.findLayerById('gfxLayer');

    if (gfxLayer.graphics && gfxLayer.graphics.items.length > 0) {
        console.log('no graphics to highlight');
    } else {
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

        gfxLayer.add(tempGraphic);
    }
};

app.summarizeFeatures = function (res) {
    if (!app.summableFields) {
        app.summableFields = [];
        app.acsFieldsConfig.forEach(conf => {
            if (conf.canSum) {
                app.summableFields.push(conf.fieldName);
            }
        });
    }

    let data = {};
    res.features.forEach(feature => {
        let attr = feature.attributes;
        Object.keys(attr).forEach(key => {
            if (app.summableFields.indexOf(key) > -1) {
                if (data[key]) {
                    data[key] += attr[key];
                } else {
                    data[key] = attr[key];
                }
            }
        });
    });

    return data;
};

function GetRepHtml(googleID) {
    return GetRepresentativeInfo(googleID)
        .then(function (data) {

            if (data.offices) {
                let mainRep;
                data.offices.forEach(office => {
                    let isKeyOffice = false;
                    app.config.googleCivicOffices.forEach(function (conf) {
                        if (office.name.indexOf(conf) > -1) {
                            isKeyOffice = true;
                        }
                    });

                    if (isKeyOffice) {
                        if (data.officials && office.officialIndices) {
                            mainRep = data.officials[office.officialIndices[0]];
                            mainRep['office'] = office.name;
                        }
                    }
                });
                if (mainRep) {
                    console.log(mainRep);

                    return `<div>
                            ${mainRep.photoUrl ? `<img class="rep-pic" src="${mainRep.photoUrl}" alt="">`: ''}
                            <strong>${mainRep.name}${mainRep.party ? ` (<strong>${mainRep.party === 'Democratic' ? '<span style="font-weight: bold; color: blue;">D</span>': '<span style="font-weight: bold; color: red;">R</span>'}</strong>) `: ''}</strong>
                            
                            <div>
                                ${mainRep.address ? `
                                    ${mainRep.address[0].line1 + " " + mainRep.address[0].city+ ", " + mainRep.address[0].state + " " + mainRep.address[0].zip}
                                    <br>` : ''}
                                ${mainRep.phones ? `<span title="Phone ${mainRep.name}" ><i class="fas fa-phone" aria-hidden="true"></i>  ${mainRep.phones[0]}</span><br>`: ''}
                                ${mainRep.emails ? `<a style="margin-left: 5px;" title="Send an email to ${mainRep.name}" href="mailto:${mainRep.emails[0]}"><i class="fa fa-envelope" aria-hidden="true"></i>  ${mainRep.emails[0]}</a>`: ''}
                            </div>
                        </div>`
                    // ${mainRep.office}
                    // ${mainRep.photoUrl ? `<img class="rep-pic" src="${mainRep.photoUrl}" alt="">`: ''}

                }
            } else {
                return '';
            }
        })
        .catch(function (err) {
            console.log(err)
        });

}

app.PopupFormat = async function (gfx) {
    let attr = gfx.graphic.attributes;
    let repHtml = '';
    if (attr['googleID']) {
        repHtml = await GetRepHtml(attr['googleID']);
    }

    return `
                <span class="popf">${attr['NAME']}</span>
                <hr class="pop">
                <div>Total Population: <strong>${attr['TOTAL_POP'].toLocaleString()}</strong></div>
                <div>Minority Population: <strong>${attr['MINORITY_POP'].toLocaleString()}</strong></div>
                ${attr['MEDIAN_AGE'] ? `<div>Median Age: <strong>${attr['MEDIAN_AGE']} years</strong></div>` : ''}
                <div>Number of Households: <strong>${attr['TOTAL_HOUSEHOLDS'].toLocaleString()}</strong></div>
                ${attr['MEDIAN_HOUSEHOLD_INCOME'] ? `<div>Median Household Income: <strong>${attr['MEDIAN_HOUSEHOLD_INCOME'].toLocaleString()}</strong></div>` : ''}
                ${repHtml ? `
                <hr>
                <h6>Representative Info</h6>
                <div>${repHtml}</div>
                ` : ''}
            `;
};

// {
//     "name": "Craig L. Brown",
//     "address": [{
//         "line1": "1015 Fair Street,",
//         "city": "Prescott",
//         "state": "AZ",
//         "zip": "86305"
//     }],
//     "party": "Republican",
//     "phones": ["(928) 771-3207"],
//     "urls": ["http://www.yavapai.us/district4/"],
//     "photoUrl": "http://www.yavapai.us/Portals/3/BrownCraig.png?ver=2015-12-23-094233-330",
//     "emails": ["web.bos.district4@yavapai.us"],
//     "office": "Board of Supervisors District 4"
// }
