require([
        "dojo/topic",
        "esri/views/2d/draw/Draw",
        "esri/Graphic"
    ],
    function (tp, Draw, Graphic) {
        tp.subscribe("panel-loaded", function (panel) {
            if (panel === "reports") {

                let $customGeographyReports = $("#customGeographyReports");
                let $bufferCheckbox = $("#useBuffer");
                let $bufferOptions = $("#bufferOptions");
                let $customSummaryButton = $(".customSummaryButton");
                let $drawingTooltip = $('#drawingTooltip');


                let draw = new Draw({
                    view: app.view
                });

                $bufferCheckbox.change(function (e) {
                    $bufferOptions.toggle();
                });

                $customSummaryButton.click(function (e) {
                    console.log(e);

                    $customSummaryButton.removeClass("active");
                    $(this).addClass("active");
                    let type = $(this).data("val");

                    // create() will return a reference to an instance of PolygonDrawAction
                    let action = draw.create(type);
                    console.log(`Started drawing ${type}`);


                    //Creates a tooltip to give user instructions on drawing
                    $("#viewDiv").mousemove(function (e) {
                        $drawingTooltip.css('left', e.pageX + 10).css('top', e.pageY + 10).css('display', 'block');
                    });

                    // focus the view to activate keyboard shortcuts for drawing polygons
                    app.view.focus();

                    // listen polygonDrawAction events to give immediate visual feedback
                    // to users as the polygon is being drawn on the view.
                    action.on("vertex-add", (e) => {
                        drawPolygon(e, type);
                    });
                    action.on("cursor-update", (e) => {
                        drawPolygon(e, type);
                    });
                    action.on("vertex-remove", (e) => {
                        drawPolygon(e, type);
                    });
                    action.on("draw-complete", (e) => {
                        drawPolygon(e, type);
                    });

                    e.preventDefault();
                });
                count = 0

                function drawPolygon(e, type) {
                    //remove existing graphic
                    app.view.graphics.removeAll();

                    const pnts = e.vertices;

                    let symbolLU = {
                        polygon: {
                            color: [0, 0, 0, .3],
                            symbolType: "simple-fill",
                            geometryType: "polygon"
                        },
                        multipoint: {
                            color: [0, 0, 0, .3],
                            symbolType: "simple-fill",
                            geometryType: "polygon"
                        },
                        polyline: {
                            color: "red",
                            symbolType: "simple-line",
                            geometryType: "polyline"
                        },
                        point: {
                            color: "red",
                            symbolType: "simple-marker",
                            geometryType: "point"
                        }
                    }

                    let symb = {
                        type: symbolLU[type].symbolType,
                        color: symbolLU[type].color,
                        style: "solid",
                        width: 2,
                        outline: {
                            color: "red",
                            width: 2
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
                        $drawingTooltip.html('Click and drag anywhere on the map to start drawing.');
                        $customSummaryButton.removeClass("active");
                        ProcessSelection(graphic)
                        // app.GetData(app.config.layerDef["countyBoundaries"], '04005').then(function (data) {
                        //     tp.publish("open-report-window", data.acsData, app.acsFieldsConfig);
                        //     $customGeographyReports.hide();
                        // })

                    } else {
                        $("#drawClearBtn").hide();
                    }

                    if (e.type === "vertex-add") {
                        $drawingTooltip.html('Double click to finish graphic');
                    }

                    app.view.graphics.add(graphic);
                }
            }

            function ProcessSelection(gfx) {
                console.log(gfx);

            }

        });
    })
