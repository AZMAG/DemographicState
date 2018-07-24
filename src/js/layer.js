require([
        "esri/layers/FeatureLayer",
        "esri/layers/MapImageLayer",
        "esri/layers/GraphicsLayer",
        "esri/PopupTemplate",
        "dojo/topic",
    ],
    function (FeatureLayer, MapImageLayer, GraphicsLayer, PopupTemplate, tp) {

        tp.subscribe("map-loaded", addLayers);

        function addLayers() {
            var layersToAdd = [];
            for (var i = 0; i < app.config.layers.length; i++) {
                var layer = app.config.layers[i];
                var layerToAdd;
                var url = app.config.mainUrl;
                if (layer.type === "feature") {
                    if (layer.popup) {
                        var popupTemplate = new PopupTemplate({
                            title: layer.popup.title,
                            content: layer.popup.content,
                            actions: layer.popup.actions
                        });
                    }
                    if (layer.url) {
                        url = layer.url;
                    }
                    layerToAdd = new FeatureLayer({
                        id: layer.id,
                        url: url + "/" + layer.ACSIndex,
                        title: layer.title,
                        definitionExpression: layer.definitionExpression,
                        layerId: layer.ACSIndex,
                        visible: layer.visible,
                        popupTemplate: popupTemplate,
                        outFields: layer.outFields || ["*"],
                        opacity: layer.opacity
                    });
                } else if (layer.type === "image") {
                    if (layer.url) {
                        url = layer.url;
                    }
                    var layerToAdd = new MapImageLayer({
                        url: url,
                        id: layer.id,
                        opacity: layer.opacity || 1,
                        title: layer.title,
                        visible: layer.visible,
                        labelsVisible: false,
                        labelingInfo: [{}],
                        sublayers: [{
                            id: layer.ACSIndex,
                            opacity: 1
                        }]
                    });
                }
                if (layerToAdd) {
                    layersToAdd.push(layerToAdd);
                    layerToAdd["sortOrder"] = layer.drawOrder;
                }
            }

            layersToAdd.sort(function (a, b) {
                return b.sortOrder - a.sortOrder;
            });

            app.map.layers.addMany(layersToAdd);

            var gfxLayer = new GraphicsLayer({
                id: "gfxLayer"
            });
            app.map.add(gfxLayer);
            tp.publish("layers-added");
        }


    });
