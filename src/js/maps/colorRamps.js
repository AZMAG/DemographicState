"use strict";
define([
        "./maps-utils",
        "dojo/topic",
        "dojo/domReady!"
    ],

    function (
        mapsutils,
        tp
    ) {
        tp.subscribe("crp", buildColorRamp);

        function buildColorRamp() {

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
                $sequentialRamps.html(GetRampsHTMLByType("sequential"));
                $divergingRamps.html(GetRampsHTMLByType("diverging"));
                $colorRampModal.modal("show");
            });

            $("#selectionRamps").on("click", ".cRamp", function () {
                $colorRampModal.modal("hide");
                $colorRamp.html($(this)[0].outerHTML);
                tp.publish("colorRamp-Changed");
            });

            function UpdateColorRampControl(data) {
                $colorRamp.html(mapsutils.ColorRampToHTML(data.colorRamp, data.rampKey, data.type));
            }

            tp.subscribe("BlockGroupRendererUpdated", UpdateColorRampControl);

            function GetRampsHTMLByType(type) {
                let rampsHtml = "";
                let numBreaks = $classBreaksCount.val();
                let ramps = mapsutils.GetRampsByNumAndType(type, numBreaks);

                Object.keys(ramps).forEach(function (key) {
                    const ramp = ramps[key];
                    let html = mapsutils.ColorRampToHTML(ramp, key, type);
                    rampsHtml += html;
                });
                return rampsHtml;
            }

        }

    }

);
