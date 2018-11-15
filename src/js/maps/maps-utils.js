require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {
        let $mapsList = $("#mapsList");
        let $colorRamp = $("#colorRamp");
        let $classBreaksCount = $("#classBreaksCount");
        let $classType = $("#classType");

        app.GetColorRamp = function (type, rampKey, numBreaks) {
            const ramps = app.GetRampsByNumAndType(type, numBreaks);
            return ramps[rampKey];
        }

        app.GetRampsByNumAndType = function (type, numBreaks) {
            let classBreakSet = app.colorRampConfig[type]["ClassBreakSets"][numBreaks];
            let allRamps = app.colorRampConfig[type]["ColorRamps"];
            let returnRamps = {};

            Object.keys(allRamps).forEach(function (rampKey) {
                let ramp = allRamps[rampKey];
                let filteredRamp = [];

                Object.keys(ramp).forEach(function (letterKey) {
                    if (classBreakSet.indexOf(letterKey) > -1) {
                        filteredRamp.push(ramp[letterKey]);
                    }
                });
                returnRamps[rampKey] = filteredRamp;
            });
            return returnRamps;
        }

        app.ColorRampToHTML = function (ramp, rampKey, rampType) {
            let html = `<div data-type="${rampType}" data-id="${rampKey}" class="cRamp">`;
            for (let i = 0; i < ramp.length; i++) {
                const rampColor = ramp[i];
                html += `<div style="background-color:rgb(${rampColor})" class="colorRampSquare"></div>`
            }
            return html += "</div>";
        }

        app.GetActiveMapData = function () {
            //Gets active map item    
            let $activeItem = $mapsList.find(".activeMapItem");
            if ($activeItem) {
                //Pull jquery data object from active map item
                return $activeItem.data("mapsConfig");
            }
        }

        app.GetCurrentMapsParams = function () {
            let conf = app.GetActiveMapData();
            let cbrCount = $classBreaksCount.val();
            let classType = $classType.val();
            let breaks = conf.breaks[classType + cbrCount];

            let rampKey = $colorRamp.find(".cRamp").data("id") || app.config.DefaultColorRamp;
            let type = $colorRamp.find(".cRamp").data("type") || app.config.DefaultColorScheme;
            //Get color ramp info

            //Get a color ramp using above data
            let colorRamp = app.GetColorRamp(type, rampKey, cbrCount);

            return {
                conf: conf,
                breaks: breaks,
                rampKey: rampKey,
                type: type,
                colorRamp: colorRamp,
                cbInfos: app.GetCurrentBreaks(breaks, colorRamp)
            }
        }

        app.pctLabel = function (val) {
            return (Math.round(val * 1000) / 10).toLocaleString('en-US');
        }

        app.numLabel = function (val) {
            return Math.round(val).toLocaleString('en-US');
        }

        app.GetCurrentBreaks = function (breaks, colorRamp) {
            const rtnData = [];
            let conf = app.GetActiveMapData();
            for (let i = 0; i < breaks.length - 1; i++) {
                const min = breaks[i];
                const max = breaks[i + 1];

                let minLabel = min;
                let maxLabel = max;

                if (conf.Type === "percent") {
                    minLabel = Math.round(minLabel * 1000) / 10 + "%";
                    maxLabel = Math.round(maxLabel * 1000) / 10 + "%";
                } else if (conf.Type === "number") {
                    minLabel = Math.round(minLabel).toLocaleString('en-US');
                    maxLabel = Math.round(maxLabel).toLocaleString('en-US');
                }

                rtnData.push({
                    minValue: min,
                    maxValue: max,
                    symbol: {
                        type: "simple-fill",
                        color: colorRamp[i]
                    },
                    label: `${minLabel} - ${maxLabel}`
                })
            }
            return rtnData;
        }
    }
)
