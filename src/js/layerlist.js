require(['dojo/topic'], function (tp) {
    tp.subscribe("map-loaded", function () {
        var $layerList = $("#layerList");
        var legendLayers = app.config.layers.filter(conf => conf.legend && !conf.legend.group);
        var arr = legendLayers.sort((a, b) => a.legend.sort - b.legend.sort);
        for (var i = 0; i < arr.length; i++) {
            var conf = arr[i];
            $layerList.append(getCheckBoxHTML(conf));
        }
        $layerList.find(".checkbox-div").click(toggleLayerItem);
    });

})

function toggleLayerItem(e) {

    //Toggle Checkbox
    let $cbox = $(this).find(".big-checkbox");
    $cbox.prop("checked", !$cbox.prop("checked"));

    let layerId = $cbox.data('layer-id');

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
                    <input type="checkbox" id="c-${c.id}" ${c.visible ? 'checked' : ''} data-layer-id="${c.id}" class="regular-checkbox big-checkbox" />
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
                    data-content="${c.definition}"><i class="glyphicon glyphicon glyphicon-info-sign"></i>
                    </a>
                </div>
            </div>
            `
}
