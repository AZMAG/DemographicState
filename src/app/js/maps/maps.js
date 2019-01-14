require([
    'esri/Map',
    'esri/views/MapView',

    'esri/layers/FeatureLayer',
    'esri/layers/MapImageLayer',
    'esri/layers/GraphicsLayer',
    'esri/PopupTemplate',
    'dojo/topic',
    'dojo/domReady!'
], function(Map, MapView, FeatureLayer, MapImageLayer, GraphicsLayer, PopupTemplate, tp) {
    app.map = new Map({
        basemap: 'gray'
    });

    app.view = new MapView({
        container: 'viewDiv',
        map: app.map,
        extent: app.config.initExtent,
        constraints: {
            rotationEnabled: false,
            minZoom: 7
        },
        ui: {
            components: []
        }
    });

    app.view.when(function() {
        tp.publish('map-loaded');
        app.view.popup.on('trigger-action', function(e) {
            if (e.action.id === 'open-report') {
                tp.publish('toggle-panel', 'reports');
                let f = e.target.selectedFeature;
                let geoid = f.attributes['GEOID'];
                let layerId = f.layer.id;
                let conf = app.config.layerDef[layerId];

                tp.publish('openReport-by-geoid', conf, geoid);
            }
        });
    });

    tp.subscribe('map-loaded', addLayers);

    function addLayers() {
        var layersToAdd = [];
        app.config.layers.forEach(layer => {
            var layerToAdd;
            var url = app.config.mainUrl;
            if (layer.type === 'feature') {
                if (layer.url) {
                    url = layer.url;
                }
                layerToAdd = new FeatureLayer({
                    id: layer.id,
                    url: url + '/' + layer.ACSIndex,
                    title: layer.title,
                    definitionExpression: layer.definitionExpression,
                    layerId: layer.ACSIndex,
                    visible: layer.visible,
                    popupTemplate: {
                        title: layer.title + '<div style="display:none">{*}</div>',
                        content: function() {
                            return `
                            {NAME:app.PopupFormat}
                            <div id="googleCivicAPITarget"></div>
                            `;
                        },
                        actions: [
                            {
                                title: 'Open Report',
                                id: 'open-report',
                                className: 'esri-icon-table'
                            }
                        ]
                    },
                    outFields: layer.outFields || ['*'],
                    opacity: layer.opacity
                });
            } else if (layer.type === 'image') {
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
                    sublayers: [
                        {
                            id: layer.ACSIndex,
                            opacity: 1
                        }
                    ]
                });
            }
            if (layerToAdd) {
                layersToAdd.push(layerToAdd);
                // layerToAdd['sortOrder'] = layer.drawOrder;
            }
        });

        // layersToAdd.sort(function(a, b) {
        //     return b.sortOrder - a.sortOrder;
        // });

        app.map.layers.addMany(layersToAdd);

        var gfxLayer = new GraphicsLayer({
            id: 'gfxLayer'
        });
        app.map.add(gfxLayer);

        //For now.... I'm waiting until the block groups layer is finished to publish the layers-added event.
        //TODO: This should prevent the legend from trying to load to early.
        //It Should probably be refactored at some point
        let bgLayer = app.map.findLayerById('blockGroups');
        var once = false;
        app.view.whenLayerView(bgLayer).then(function(lyrView) {
            lyrView.watch('updating', function(value) {
                if (!value && !once) {
                    // app.blockGroupLyrView = lyrView;
                    tp.publish('layers-added');
                    once = true;
                }
            });
        });
    }
});
