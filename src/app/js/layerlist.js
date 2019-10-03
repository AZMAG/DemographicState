"use strict";
define([
        "mag/config/config",
        "dojo/topic"
    ],
    function (
        config,
        tp
    ){
    tp.subscribe("panel-loaded", function (panel) {
        if (panel === "layers-view") {
            var $layerList = $("#layerList");
            var layers = config.layers.filter(conf => conf.showTOC);

            var arr = layers.sort((a, b) => a.layerListOrder - b.layerListOrder);

            for (var i = 0; i < arr.length; i++) {
                var conf = arr[i];

                if (conf.id !== "blockGroups") {
                    $layerList.append(getCheckBoxHTML(conf));
                }
            }
            $layerList.find(".checkbox-div").click(toggleLayerItem);
            $layerList.find("[data-toggle=popover]").popover();
        }
    });



    function toggleLayerItem(e) {

        //Toggle Checkbox
        let $cbox = $(this).find(".big-checkbox");
        $cbox.prop("checked", !$cbox.prop("checked"));

        let layerId = $cbox.data("layer-id");

        //Toggle Layer
        let layer = app.map.findLayerById(layerId);
        if (layer) {
            layer.visible = !layer.visible;
        } else {
            let grpLayers = getLayersByGroupId(layerId);

            for (var i = 0; i < grpLayers.length; i++) {
                var grpLayer = grpLayers[i];

                let lay = app.map.findLayerById(grpLayer.id);
                if (lay) {
                    lay.visible = !lay.visible;
                }
            }
        }
    }

    function getCheckBoxHTML(conf) {
        var c = $.extend({}, conf);

        if (c.legend.group) {
            c.id = c.legend.group.id;
            c.title = c.legend.group.title;
        }

        return `
                <div>
                    <div class="checkbox-div">
                        <input type="checkbox" id="c-${c.id}" ${c.visible ? "checked" : ""} data-layer-id="${c.id}" class="regular-checkbox big-checkbox" />
                        <label></label>
                        <label class="layerLabel">${c.title}</label>
                        <a
                        style="height: 25px;"
                        tabindex="0"
                        role="button"
                        data-html="true"
                        data-toggle="popover"
                        data-placement="auto"
                        data-trigger="hover"
                        title="${c.title}"
                        data-content="${c.definition}"><i class="fas fa-info-circle"></i>
                        </a>
                    </div>
                </div>
                `;
    }
});