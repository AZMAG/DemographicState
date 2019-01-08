    require([
        "esri/views/2d/draw/Draw",
        "esri/Graphic",
        "dojo/topic"
    ], function (
        Draw,
        Graphic,
        tp
    ) {
        let $drawWidget = $("#drawWidget");
        let $drawingTooltip = $('#drawingTooltip');

        tp.subscribe("map-loaded", function () {
            // add the button for drawing polygons underneath zoom buttons
            app.view.ui.add($drawWidget[0], "bottom-right");

            var draw = new Draw({
                view: app.view
            });

            //Create the window that pops open when a user first clicks the tool
            $drawWidget.popover({
                title: 'Draw Custom Graphics',
                content: `<div id="drawInstructions">
                    <div style="margin-right: 8px;">
                        <div class="flexContainer">
                            <span class="pickerLabel">Fill Color:</span>
                            <input id="fillPicker" />
                        </div>
                        <div class="flexContainer">
                            <span class="pickerLabel">Outline Color:</span>
                            <input id="outlinePicker" />
                        </div>
                    </div>
                    <div class="verticalFlex">
                        <div class="slidecontainer">
                            <span style="padding: 2px;">Transparency</span>
                            <input id="gfxSlider" type="range" min="0" max="1" value=".8" step=".05" class="round slider">
                            
                        </div>
                        <button id='drawClearBtn' class='btn btn-sm'>Clear  <i class="fas fa-trash-alt"></i></button>
                        <button id='drawAddBtn' class='btn btn-sm'>New  <i class="fas fa-plus"></i></button>
                    </div>
                </div>`,
                placement: 'auto',
                html: true
            });

            //Not sure if we need a label similar to the maing legend.  This could be added later.
            //<span id="gfxSliderLabel">80%</span>

            var outlineColor = 'black';
            var transparency = .8;
            var fillColor = {
                r: 0,
                g: 0,
                b: 255,
                a: transparency
            };

            //This function is called on change of the color pickers, the transparency slider, or when a graphic is being drawn
            function reDrawGraphics() {
                outlineColor = $("#outlinePicker").data("kendoColorPicker").value();
                fillColor = hexToRgb($("#fillPicker").data("kendoColorPicker").value());

                transparency = $("#gfxSlider").val();

                // Again, not sure if we want this label
                // $("#gfxSliderLabel").html(`${Math.floor(transparency * 100)}%`)

                //Add alpha to the fill
                fillColor['a'] = transparency;

                //Apply the new colors to the current graphic if it exists
                if (app.view.graphics.items.length > 0) {
                    var newGfx = app.view.graphics.items[0].clone();
                    newGfx.symbol.color = fillColor;
                    newGfx.symbol.outline.color = outlineColor;
                    app.view.graphics.removeAll();
                    app.view.graphics.add(newGfx);
                }
            }

            var panelOpen = false;
            $drawWidget.click(StartDrawing);

            function StartDrawing() {
                if (panelOpen) {
                    $drawWidget.popover('hide');
                } else {
                    $drawWidget.popover('show');

                    $("#fillPicker").kendoColorPicker({
                        value: rgbToHex(fillColor.r, fillColor.g, fillColor.b),
                        buttons: false,
                        change: reDrawGraphics
                    });
                    $("#outlinePicker").kendoColorPicker({
                        value: outlineColor,
                        buttons: false,
                        change: reDrawGraphics
                    });
                    var $gfxSlider = $("#gfxSlider");
                    $gfxSlider.val(transparency);

                    // $("#gfxSliderLabel").html(`${Math.floor(transparency * 100)}%`)
                    $gfxSlider.on("input", reDrawGraphics);

                    // create() will return a reference to an instance of PolygonDrawAction
                    var action = draw.create("polygon");

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

                }
                panelOpen = !panelOpen;
            }


            $("body").on("click", "#drawClearBtn", function () {
                app.view.graphics.removeAll();
                $(this).hide();
                $("#drawAddBtn").show();
            })

            $("body").on("click", "#drawAddBtn", function () {
                panelOpen = false;
                StartDrawing();
            })

            // this function is called from the polygon draw action events
            // to provide a visual feedback to users as they are drawing a polygon
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
                        color: fillColor,
                        style: "solid",
                        outline: {
                            color: outlineColor,
                            width: 2
                        }
                    }
                });

                if (event.type === "draw-complete") {
                    $("#drawClearBtn").show();
                    $("#drawAddBtn").hide();
                    $("#viewDiv").off("mousemove");

                    $drawingTooltip.hide();
                    $drawingTooltip.html('Click and drag anywhere on the map to start drawing.');
                } else {
                    $("#drawClearBtn").hide();
                }

                if (event.type === "vertex-add") {
                    $drawingTooltip.html('Double click to finish graphic');
                }

                app.view.graphics.add(graphic);
            }
        });
    });
