//This file listens for any changes to color ramps, number of class breaks,
//or map changes and updates the block groups renderer.
"use strict";
define([
    "mag/maps/maps-utils",
    "dojo/topic",
    "dojo/domReady!"
], function (
    mapsutils,
    tp
    ) {

    var cbr = {
        GetCurrentRenderer: async function () {
            let data = await mapsutils.GetCurrentMapsParams();
            //Construct renderer object
            let renderer = {
                type: "class-breaks",
                field: data.conf.FieldName,
                normalizationField: data.conf.NormalizeField,
                classBreakInfos: data.cbInfos,
                legendOptions: {
                    title: `${data.conf.category}  -  ${data.conf.Name}`
                },
                defaultLabel: "No Data",
                defaultSymbol: {
                    type: "simple-fill",
                    color: {
                        r: "211",
                        g: "211",
                        b: "211"
                    },
                    outline: {
                        color: [0, 0, 0, 0.1],
                        width: 0.5
                    }
                }
            }
            return {
                renderer,
                data
            };
        },
        
        UpdateMapRenderer: function() {
            this.GetCurrentRenderer().then(function (res) {
                if (res.renderer) {
                    //Update the layer with the new renderer.
                    let layer = app.map.findLayerById("blockGroups");
                    let subLayer = layer.findSublayerById(0);
    
                    subLayer.renderer = res.renderer;
                    tp.publish("BlockGroupRendererUpdated", res.data);
                }
            })
        }
    }

    let $dynamicCBRCheckbox = $("#dynamicCBRCheckbox");
    $("#classType").change(function () {
        let type = $(this).val();
        let dynamic = $dynamicCBRCheckbox.is(":checked");

        if (type === "Custom" && dynamic) {
            $dynamicCBRCheckbox.prop('checked', false);
            $dynamicCBRCheckbox.attr("disabled", true);
        } else {
            $dynamicCBRCheckbox.attr("disabled", false);
        }

        tp.publish("classType-change", type);

        if (type !== "Custom") {
            cbr.UpdateMapRenderer();
        }
    });

    $("#classBreaksCount").change(function () {
        tp.publish("classBreaksCount-change");
    });

    


    // Subscribe to other change events
    // and update the renderer when any of them fire.
    tp.subscribe("layers-added", cbr.UpdateMapRenderer());
    tp.subscribe("colorRamp-Changed", cbr.UpdateMapRenderer());
    tp.subscribe("map-selected", cbr.UpdateMapRenderer());
    tp.subscribe("customClassBreaks-selected", cbr.UpdateMapRenderer());
    tp.subscribe("classBreaksCount-change", cbr.UpdateMapRenderer());

    tp.subscribe("layers-added", function () {
        app.view.watch("stationary", function (stationary) {
            if (stationary) {
                if ($dynamicCBRCheckbox.is(":checked")) {
                    cbr.UpdateMapRenderer();
                }
            }
        });
        // setTimeout(() => {
        //     UpdateMapRenderer();
        // }, 90);

        $dynamicCBRCheckbox.change(function () {
            cbr.UpdateMapRenderer();
        })

        let $dynamicHelp = $("#dynamicHelp");
        $dynamicHelp.popover({
            html: true
        });

    });
    return cbr;
});
