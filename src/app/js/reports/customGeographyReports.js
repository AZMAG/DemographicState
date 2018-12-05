require([
        "dojo/topic",
        "esri/views/2d/draw/Draw",
        "esri/Graphic"
    ],
    function (tp, Draw, Graphic) {
        tp.subscribe("layers-added", function () {

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
                $customSummaryButton.removeClass("active");
                $(this).addClass("active");
                let type = $(this).data("val");

                // create() will return a reference to an instance of PolygonDrawAction
                var action = draw.create(type);

                //Creates a tooltip to give user instructions on drawing
                $("#viewDiv").mousemove(function (e) {
                    $drawingTooltip.css('left', e.pageX + 10).css('top', e.pageY + 10).css('display', 'block');
                });

                // focus the view to activate keyboard shortcuts for drawing polygons
                app.view.focus();

                // listen polygonDrawAction events to give immediate visual feedback
                // to users as the polygon is being drawn on the view.
                action.on("vertex-add", drawPolygon);
                action.on("cursor-update", drawPolygon);
                action.on("vertex-remove", drawPolygon);
                action.on("redo", drawPolygon);
                action.on("undo", drawPolygon);
                action.on("draw-complete", drawPolygon);

                e.preventDefault();
            });

            function drawPolygon(event) {

                var vertices = event.vertices;

                //remove existing graphic
                app.view.graphics.removeAll();

                // create a new graphic representing the polygon, add it to the view
                var graphic = new Graphic({
                    geometry: {
                        rings: vertices,
                        spatialReference: app.view.spatialReference,
                        type: 'polygon'
                    },
                    symbol: {
                        type: "simple-fill",
                        color: [0, 0, 0, .3],
                        style: "solid",
                        outline: {
                            color: "red",
                            width: 1.5
                        }
                    }
                });

                if (event.type === "draw-complete") {
                    $("#viewDiv").off("mousemove");

                    $drawingTooltip.hide();
                    $drawingTooltip.html('Click and drag anywhere on the map to start drawing.');
                    $customSummaryButton.removeClass("active");

                    app.GetData(app.config.layerDef["countyBoundaries"], '04005').then(function (data) {
                        tp.publish("open-report-window", data.acsData, app.acsFieldsConfig);
                        $customGeographyReports.hide();
                    })
                } else {
                    $("#drawClearBtn").hide();
                }

                if (event.type === "vertex-add") {
                    $drawingTooltip.html('Double click to finish graphic');
                }



                app.view.graphics.add(graphic);
            }
        });
    })
