"use strict";
require(["dojo/topic",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/geometry/geometryEngine"
], function (
    tp,
    SketchViewModel,
    Graphic,
    geometryEngine
) {
    let isInited = false;
    tp.subscribe("panel-loaded", init);

    if (app.panelLoaded["reports-view"] && !isInited) {
        init();
    }

    function init() {
        isInited = true;
        tp.subscribe("gfxLayer-loaded", function () {

            let $customGeographyReports = $("#customGeographyReports");
            let $bufferCheckbox = $("#useBuffer");
            let $bufferOptions = $("#bufferOptions");
            let $customSummaryButton = $(".customSummaryButton");
            let $drawingTooltip = $("#drawingTooltip");
            let $bufferSize = $bufferOptions.find("#bufferSize");
            let $bufferUnit = $bufferOptions.find("#bufferUnit");
            let $useZoom = $("#useZoom");

            let drawMessages = {
                point: {
                    start: "Click anywhere to select a point of interest."
                },
                polygon: {
                    start: "Click or drag anywhere on the map to start drawing.",
                    during: "Double click to finish drawing, or click/drag to change the selected shape."
                },
                polyline: {
                    start: "Click to add first point in the corridor of interest.",
                    during: "Double click to finish drawing, or Click to add another point to the selected corridor."
                },
                rectangle: {
                    start: "Click and drag to create a rectangle and select a region of interest.",
                    during: "Release to finish drawing and select a region of interest."
                }
            };
            let sketchVM;
            sketchVM = new SketchViewModel({
                view: app.view,
                layer: app.map.findLayerById("gfxLayer"),
                updateOnGraphicClick: false,
                pointSymbol: {
                    type: "simple-marker",
                    style: "circle",
                    size: 6,
                    color: [255, 0, 0],
                    outline: {
                        color: [50, 50, 50],
                        width: 1
                    }
                },
                polygonSymbol: {
                    type: "simple-fill",
                    style: "backward-diagonal",
                    color: [255, 0, 0, 1],
                    outline: {
                        color: 'red',
                        width: 2
                    }
                },
                polylineSymbol: {
                    type: "simple-line",
                    color: [255, 0, 0],
                    width: 2
                }
            });

            $bufferCheckbox.change(function (e) {
                let checked = $bufferCheckbox.prop("checked");
                if (checked) {
                    $bufferOptions.css("display", "flex");
                } else {
                    $bufferOptions.hide();
                }
            });
            $customSummaryButton.click(function (e) {
                e.preventDefault();
                $customSummaryButton.removeClass("active");
                $(this).addClass("active");
                let type = $(this).data("val");
                $drawingTooltip.html(drawMessages[type].start);
                sketchVM.create(type);

                //Creates a tooltip to give user instructions on drawing
                $("#viewDiv").mousemove(function (e) {
                    $drawingTooltip
                        .css("left", e.pageX + 10)
                        .css("top", e.pageY + 10)
                        .css("display", "block");
                });

                // focus the view to activate keyboard shortcuts for drawing polygons
                app.view.focus();
            });

            sketchVM.on("update", function (e) {
                let buffer = $bufferCheckbox.is(":checked");
                if (buffer) {
                    AddBufferedGraphic(e);
                }
            });

            function AddBufferedGraphic(e) {
                if (e.graphic) {
                    let bufferGraphicsLayer = app.map.findLayerById("bufferGraphics");
                    bufferGraphicsLayer.removeAll();
                    let buffGfx = null;
                    let buffered = geometryEngine.buffer(e.graphic.geometry, $bufferSize.val(), $bufferUnit.val());
                    buffGfx = new Graphic({
                        geometry: buffered,
                        symbol: {
                            type: "simple-fill",
                            color: [0, 0, 0, 0],
                            outline: {
                                style: "dot",
                                color: "black",
                                width: 2
                            }
                        }
                    });
                    bufferGraphicsLayer.add(buffGfx);
                    return buffGfx;
                }
            }

            sketchVM.on("create", function (e) {
                let buffer = $bufferCheckbox.is(":checked");

                if (e.state === "complete") {
                    $("#viewDiv").off("mousemove");
                    $drawingTooltip.hide();
                    $customSummaryButton.removeClass("active");

                    if (buffer) {
                        let buffedGfx = AddBufferedGraphic(e);
                        ProcessSelection(buffedGfx);
                    } else {
                        ProcessSelection(e.graphic);
                    }
                } else {
                    if (buffer) {
                        AddBufferedGraphic(e);
                    }
                }
            });

            tp.subscribe("reset-reports", function () {
                if (sketchVM) {
                    //Clears drawing if return button is clicked or panel is closed.
                    $("#viewDiv").off("mousemove");
                    $(".customSummaryButton").removeClass("active");
                    $drawingTooltip.hide();
                    $bufferCheckbox.prop("checked", false);
                    sketchVM.reset();
                }
            });



            function ProcessSelection(gfx) {
                app.GetData(app.config.layerDef["blockGroups"], null, gfx.geometry).then(function (data) {
                    var acsData = app.summarizeFeatures(data.acsData);
                    var censusData = app.summarizeFeatures(data.censusData);

                    if (data.acsData.features.length === 0) {
                        app.clearDrawnGraphics();
                        // TODO: This should be prettied up at some point.
                        // Just using the basic alert function isn"t pretty enough.
                        alert("Your selection did not return any results.  Please try again.");
                    } else {
                        app.selectedReport.acsData = {
                            features: [{
                                attributes: acsData,
                                count: data.acsData.features.length,
                                ids: data.acsData.features.map(feature => feature.attributes["GEOID"])
                            }]
                        };

                        app.selectedReport.censusData = {
                            features: [{
                                attributes: censusData,
                                count: data.censusData.features.length,
                                ids: data.censusData.features.map(feature => feature.attributes["GEOID"])
                            }]
                        };
                        tp.publish("open-report-window", app.selectedReport, "acs");
                        $customGeographyReports.hide();
                        app.AddHighlightGraphics(data.acsData.features, $useZoom.is(":checked"));
                        $(".reportFormArea").hide();
                    }
                });
            }
        })
    }


});
