//This file listens for any changes to color ramps, number of class breaks,
//or map changes and updates the block groups renderer.
"use strict";
<<<<<<< HEAD
require([
        'dojo/topic',
        'dojo/domReady!'
    ],
    function(tp) {
        $('#classType').change(function() {
            let type = $(this).val();
            tp.publish('classType-change', type);
            if (type !== 'Custom') {
                UpdateMapRenderer();
            }
        });

        $('#classBreaksCount').change(function() {
            tp.publish('classBreaksCount-change');
        });

        function UpdateMapRenderer() {
            let data = app.GetCurrentMapsParams();

            // if (customBreaks && customBreaks.length) {
            //     data.cbInfos = customBreaks;
            // }
            //Construct renderer object
            let renderer = {
                type: 'class-breaks',
=======
require(["dojo/topic", "dojo/domReady!"], function (tp) {
    $("#classType").change(function () {
        let type = $(this).val();
        tp.publish("classType-change", type);
        if (type !== "Custom") {
            UpdateMapRenderer();
        }
    });

    $("#classBreaksCount").change(function () {
        tp.publish("classBreaksCount-change");
    });

    function UpdateMapRenderer() {
        app.GetCurrentMapsParams().then(function (data) {
            //Construct renderer object
            let renderer = {
                type: "class-breaks",
>>>>>>> Jack-Develop-Branch
                field: data.conf.FieldName,
                normalizationField: data.conf.NormalizeField,
                classBreakInfos: data.cbInfos,
                legendOptions: {
<<<<<<< HEAD
                    title: data.conf.ShortName
                },
                defaultLabel: 'No Data',
                defaultSymbol: {
                    type: 'simple-fill',
                    color: {
                        r: '211',
                        g: '211',
                        b: '211'
=======
                    title: `${data.conf.category}  -  ${data.conf.Name}`
                },
                defaultLabel: "No Data",
                defaultSymbol: {
                    type: "simple-fill",
                    color: {
                        r: "211",
                        g: "211",
                        b: "211"
>>>>>>> Jack-Develop-Branch
                    },
                    outline: {
                        color: [0, 0, 0, 0.1],
                        width: 0.5
                    }
                }
            };

            if (renderer) {
                //Update the layer with the new renderer.
<<<<<<< HEAD
                let layer = app.map
                    .findLayerById('blockGroups')
                    .findSublayerById(0);
                layer.renderer = renderer;
                tp.publish('BlockGroupRendererUpdated', renderer);
            }
            // }
        }

        // Subscribe to other change events
        // and update the renderer when any of them fire.
        tp.subscribe('layers-added', UpdateMapRenderer);
        tp.subscribe('colorRamp-Changed', UpdateMapRenderer);
        tp.subscribe('map-selected', UpdateMapRenderer);
        tp.subscribe('customClassBreaks-selected', UpdateMapRenderer);
        tp.subscribe('classBreaksCount-change', UpdateMapRenderer);
    }
);
=======
                let layer = app.map.findLayerById("blockGroups").findSublayerById(0);
                layer.renderer = renderer;
                tp.publish("BlockGroupRendererUpdated", data);
            }
        });
    }

    // Subscribe to other change events
    // and update the renderer when any of them fire.
    tp.subscribe("layers-added", UpdateMapRenderer);
    tp.subscribe("colorRamp-Changed", UpdateMapRenderer);
    tp.subscribe("map-selected", UpdateMapRenderer);
    tp.subscribe("customClassBreaks-selected", UpdateMapRenderer);
    tp.subscribe("classBreaksCount-change", UpdateMapRenderer);

    tp.subscribe("layers-added", function () {
        let $dynamicCBRCheckbox = $("#dynamicCBRCheckbox");
        app.view.watch("stationary", function (stationary) {
            if (stationary) {
                if ($dynamicCBRCheckbox.is(":checked")) {
                    UpdateMapRenderer();
                }
            }
        });
        setTimeout(() => {
            UpdateMapRenderer();
        }, 90);


        let $dynamicHelp = $("#dynamicHelp");
        $dynamicHelp.popover({
            html: true
        });

    });
});
>>>>>>> Jack-Develop-Branch
