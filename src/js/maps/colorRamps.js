require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {
        let $colorRamp = $("#colorRamp");
        let $rampType = $("#rampType");
        let $classBreaksCount = $("#classBreaksCount");
        let $colorRampModal = $("#colorRampModal");

        let $sequentialRamps = $("#sequentialRamps");
        let $divergingRamps = $("#divergingRamps");

        $rampType.change(function () {
            $sequentialRamps.toggle();
            $divergingRamps.toggle();
        });

        $colorRamp.click(function () {
            $sequentialRamps.html(GetRampsHTMLByType("Sequential"));
            $divergingRamps.html(GetRampsHTMLByType("Diverging"));
            $colorRampModal.modal('show');
        });

        $("#selectionRamps").on("click", ".cRamp", function () {
            $colorRampModal.modal('hide');
            $colorRamp.html($(this)[0].outerHTML);
            tp.publish("colorRamp-Changed");
        });

        function UpdateColorRampControl(data) {
            $colorRamp.html(ColorRampToHTML(data.newRamp, data.rampKey, data.type));
        }

        tp.subscribe('BlockGroupRendererUpdated', UpdateColorRampControl);

        function GetRampsHTMLByType(type) {
            let rampsHtml = ''
            let numBreaks = $classBreaksCount.val();
            let ramps = GetRampsByNumAndType(type, numBreaks);

            Object.keys(ramps).forEach(function (key) {
                const ramp = ramps[key];
                let html = ColorRampToHTML(ramp, key, type);
                rampsHtml += html;
            });
            return rampsHtml;
        }
    })


function GetColorRamp(type, rampKey, numBreaks) {
    const ramps = GetRampsByNumAndType(type, numBreaks);
    return ramps[rampKey];
}

function GetRampsByNumAndType(type, numBreaks) {
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

function ColorRampToHTML(ramp, rampKey, rampType) {
    let html = `<div data-type="${rampType}" data-id="${rampKey}" class="cRamp">`;
    for (let i = 0; i < ramp.length; i++) {
        const rampColor = ramp[i];
        html += `<div style="background-color:rgb(${rampColor})" class="colorRampSquare"></div>`
    }
    return html += "</div>";
}
