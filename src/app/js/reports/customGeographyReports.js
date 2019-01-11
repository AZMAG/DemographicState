"use strict";
require([
        "dojo/topic",
        "esri/views/2d/draw/Draw",
        "esri/Graphic"
    ],
    function(tp, Draw, Graphic) {
        tp.subscribe("panel-loaded", function(panel) {
            if (panel === "reports") {
                let $customGeographyReports = $("#customGeographyReports");
                let $bufferCheckbox = $("#useBuffer");
                let $bufferOptions = $("#bufferOptions");
                let $customSummaryButton = $(".customSummaryButton");
                let $drawingTooltip = $("#drawingTooltip");

                let draw = new Draw({
                    view: app.view
                });

                $bufferCheckbox.change(function(e) {
                    $bufferOptions.toggle();
                });

                $customSummaryButton.click(function(e) {
                    $customSummaryButton.removeClass("active");
                    $(this).addClass("active");
                    let type = $(this).data("val");

                    // create() will return a reference to an instance of PolygonDrawAction
                    let action = draw.create(type);

                    //Creates a tooltip to give user instructions on drawing
                    $("#viewDiv").mousemove(function(e) {
                        $drawingTooltip
                            .css("left", e.pageX + 10)
                            .css("top", e.pageY + 10)
                            .css("display", "block");
                    });

                    // focus the view to activate keyboard shortcuts for drawing polygons
                    app.view.focus();

                if (buffer) {
                    let buffered = geometryEngine.buffer(graphic.geometry, $bufferSize.val(), $bufferUnit.val());
                    buffGfx = new Graphic({
                        geometry: buffered,
                        symbol: {
                            type: 'simple-fill',
                            color: [0, 0, 0, 0],
                            outline: {
                                style: 'dot',
                                color: 'black',
                                width: 2
                            }
                        }
                    };

                    // create a new graphic representing the polygon, add it to the view
                    var graphic = new Graphic({
                        geometry: {
                            rings: pnts,
                            paths: [pnts],
                            spatialReference: app.view.spatialReference,
                            type: symbolLU[type].geometryType,
                            x: e.coordinates ? e.coordinates[0] : undefined,
                            y: e.coordinates ? e.coordinates[1] : undefined
                        },
                        symbol: symb
                    });

                    if (e.type === "draw-complete") {
                        $("#viewDiv").off("mousemove");

                        $drawingTooltip.hide();
                        $drawingTooltip.html("Click and drag anywhere on the map to start drawing.");
                        $customSummaryButton.removeClass("active");
                        ProcessSelection(graphic);
                        // app.GetData(app.config.layerDef["countyBoundaries"], "04005").then(function (data) {
                        //     tp.publish("open-report-window", data.acsData, app.acsFieldsConfig);
                        //     $customGeographyReports.hide();
                        // })
                    } else {
                        $("#drawClearBtn").hide();
                    }

                    if (e.type === "vertex-add") {
                        $drawingTooltip.html("Double click to finish graphic");
                    }

                    app.view.graphics.add(graphic);
                }
            }

        function HighlightSelection(original, selected) {
            app.AddHighlightGraphics(selected.features);
        }

        let summableFields = [];
        app.acsFieldsConfig.forEach(conf => {
            if (conf.canSum) {
                summableFields.push(conf.fieldName);
            }
        });

        function ProcessSelection(gfx) {
            const q = {
                geometry: gfx.geometry,
                returnGeometry: true,
                outFields: ['*'],
                outSpatialReference: 102100
            };

            function ProcessSelection(gfx) {
                const q = {
                    geometry: gfx.geometry,
                    returnGeometry: true,
                    outFields: ["*"],
                    outSpatialReference: 102100
                };

                let bgLayer = app.map.findLayerById("blockGroups").sublayers.getItemAt(0);

                bgLayer.queryFeatures(q).then(res => {
                    let data = {};

                    HighlightSelection(gfx, res);

                res.features.forEach(feature => {
                    let attr = feature.attributes;
                    Object.keys(attr).forEach(key => {
                        if (summableFields.indexOf(key) > -1) {
                            if (data[key]) {
                                data[key] += attr[key];
                            } else {
                                data[key] = attr[key];
                            }

                        }

                    });

                    tp.publish(
                        "open-report-window", {
                            features: [{
                                attributes: data
                            }]
                        },
                        app.acsFieldsConfig
                    );

                    $(".reportFormArea").hide();
                });
            }
        });
    });