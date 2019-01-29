"use strict";
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
            $colorRampModal.modal("show");
        });

        $("#selectionRamps").on("click", ".cRamp", function () {
            $colorRampModal.modal("hide");
            $colorRamp.html($(this)[0].outerHTML);
            tp.publish("colorRamp-Changed");
        });

        function UpdateColorRampControl(data) {
            $colorRamp.html(app.ColorRampToHTML(data.colorRamp, data.rampKey, data.type));
        }

        tp.subscribe("BlockGroupRendererUpdated", UpdateColorRampControl);

        function GetRampsHTMLByType(type) {
            let rampsHtml = "";
            let numBreaks = $classBreaksCount.val();
            let ramps = app.GetRampsByNumAndType(type, numBreaks);

            Object.keys(ramps).forEach(function (key) {
                const ramp = ramps[key];
                let html = app.ColorRampToHTML(ramp, key, type);
                rampsHtml += html;
            });
            return rampsHtml;
        }
    });
