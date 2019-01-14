require(['dojo/topic', 'esri/views/2d/draw/Draw', 'esri/Graphic', 'esri/geometry/geometryEngine'], function(
    tp,
    Draw,
    Graphic,
    geometryEngine
) {
    tp.subscribe('panel-loaded', function(panel) {
        let $customGeographyReports = $('#customGeographyReports');
        let $bufferCheckbox = $('#useBuffer');
        let $bufferOptions = $('#bufferOptions');
        let $customSummaryButton = $('.customSummaryButton');
        let $drawingTooltip = $('#drawingTooltip');
        let $bufferSize = $bufferOptions.find('#bufferSize');
        let $bufferUnit = $bufferOptions.find('#bufferUnit');
        let $loadingSpinner = $('.loading-container');

        if (panel === 'reports') {
            let draw = new Draw({
                view: app.view
            });

            $bufferCheckbox.change(function(e) {
                $bufferOptions.toggle();
            });

            $customSummaryButton.click(function(e) {
                $customSummaryButton.removeClass('active');
                $(this).addClass('active');
                let type = $(this).data('val');

                // create() will return a reference to an instance of PolygonDrawAction
                let action = draw.create(type);

                //Creates a tooltip to give user instructions on drawing
                $('#viewDiv').mousemove(function(e) {
                    $drawingTooltip
                        .css('left', e.pageX + 10)
                        .css('top', e.pageY + 10)
                        .css('display', 'block');
                });

                // focus the view to activate keyboard shortcuts for drawing polygons
                app.view.focus();

                // listen polygonDrawAction events to give immediate visual feedback
                // to users as the polygon is being drawn on the view.
                action.on('vertex-add', e => {
                    drawPolygon(e, type);
                });
                action.on('cursor-update', e => {
                    drawPolygon(e, type);
                });
                action.on('vertex-remove', e => {
                    drawPolygon(e, type);
                });
                action.on('draw-complete', e => {
                    drawPolygon(e, type);
                });

                e.preventDefault();
            });
            count = 0;

            function drawPolygon(e, type) {
                //remove existing graphic
                app.view.graphics.removeAll();

                const pnts = e.vertices;

                let symbolLU = {
                    polygon: {
                        color: [0, 0, 0, 0.3],
                        symbolType: 'simple-fill',
                        geometryType: 'polygon',
                        style: 'solid'
                    },
                    multipoint: {
                        color: [0, 0, 0, 0.3],
                        symbolType: 'simple-fill',
                        geometryType: 'polygon',
                        style: 'solid'
                    },
                    polyline: {
                        color: 'red',
                        symbolType: 'simple-line',
                        geometryType: 'polyline',
                        style: 'solid'
                    },
                    point: {
                        color: 'red',
                        symbolType: 'simple-marker',
                        geometryType: 'point',
                        style: 'circle'
                    }
                };

                let symb = {
                    type: symbolLU[type].symbolType,
                    color: symbolLU[type].color,
                    style: symbolLU[type].style,
                    width: 2,
                    size: 4,
                    outline: {
                        color: 'red',
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

                let buffGfx = null;

                let buffer = $bufferCheckbox.is(':checked');

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
                    });
                    app.view.graphics.add(buffGfx);
                }

                if (e.type === 'draw-complete') {
                    $('#viewDiv').off('mousemove');

                    $drawingTooltip.hide();
                    $drawingTooltip.html('Click and drag anywhere on the map to start drawing.');
                    $customSummaryButton.removeClass('active');

                    if (buffGfx) {
                        ProcessSelection(buffGfx);
                    } else {
                        ProcessSelection(graphic);
                    }
                } else {
                    $('#drawClearBtn').hide();
                }

                if (e.type === 'vertex-add') {
                    $drawingTooltip.html('Double click to finish graphic');
                }

                app.view.graphics.add(graphic);
            }
        }

        function ProcessSelection(gfx) {
            //Start the loading spinner
            $loadingSpinner.css('display', 'flex');

            app.GetData(app.config.layerDef['blockGroups'], null, gfx.geometry).then(function(data) {
                var acsdata = app.summarizeFeatures(data.acsData);
                var censusdata = app.summarizeFeatures(data.censusData);

                app.selectedReport.acsData = {
                    features: [
                        {
                            attributes: acsdata,
                            count: data.acsData.features.length
                        }
                    ]
                };

                app.selectedReport.censusData = {
                    features: [
                        {
                            attributes: censusdata,
                            count: data.acsData.features.length
                        }
                    ]
                };

                tp.publish('open-report-window', app.selectedReport, 'acs');
                $customGeographyReports.hide();
                app.AddHighlightGraphics(data.acsData.features);
                $loadingSpinner.css('display', 'none');
                $('.reportFormArea').hide();
            });
        }
    });
});
