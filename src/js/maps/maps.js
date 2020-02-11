"use strict";
define([
    "../main",
    "../config/appConfig",
    "../utilities",
    "./maps-utils",
    "./cbr",
    "magcore/utils/application",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/TileLayer",
    "esri/geometry/Extent",
    "esri/layers/GraphicsLayer",
    "dojo/topic",
    "dojo/domReady!"
], function (
    mag,
    config,
    utilities,
    mapsutils,
    cbr,
    appUtils,
    Map,
    MapView,
    FeatureLayer,
    MapImageLayer,
    TileLayer,
    Extent,
    GraphicsLayer,
    tp
) {

    initMap();

    function initMap() {
        mapsutils.map = new Map({
            basemap: "gray"
        });

        mapsutils.view = new MapView({
            container: "viewDiv",
            map: mapsutils.map,
            extent: mag.getExtent() ? mag.getExtent() : config.initExtent,
            constraints: {
                rotationEnabled: false,
                minZoom: 7
            },
            ui: {
                components: []
            },
            popup: {
                dockEnabled: false,
                collapseEnabled: false,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false,
                }
            }
            // highlightOptions: {
            //     color: [255, 255, 0, 1],
            //     haloOpacity: 0.9,
            //     fillOpacity: 0.95
            // }
        });

        mapsutils.view.when(function () {
            tp.publish('map-loaded');
            addLayers();
            mapsutils.view.popup.on('trigger-action', function (e) {
                if (e.action.id === 'open-report') {
                    tp.publish('toggle-panel', 'reports');
                    let f = e.target.selectedFeature;
                    let geoid = f.attributes["GEOID"];
                    let layerId = f.layer.id;
                    let conf = config.layerDef[layerId];

                    tp.publish('openReport-by-geoids', conf, [geoid]);
                }
            });
        });

        async function addBGLayer() {
            let res = await cbr.GetCurrentRenderer();
            let conf = config.layerDef['blockGroups'];
            let url = config.mainUrl;
            if (conf.url) {
                url = conf.url;
            }
            let bgLayer = new MapImageLayer({
                url: url,
                id: conf.id,
                opacity: conf.opacity || 1,
                title: conf.title,
                visible: conf.visible,
                labelsVisible: false,
                labelingInfo: [{}],
                sublayers: [{
                    id: conf.ACSIndex,
                    opacity: 1
                }]
            });

            bgLayer.findSublayerById(0).renderer = res.renderer;
            mapsutils.map.add(bgLayer);
            return;
        }

        async function addLayers() {
            await addBGLayer();

            var layersToAdd = [];
            config.layers.forEach(layer => {
                var layerToAdd;
                var url = config.mainUrl;
                if (layer.type === 'feature') {
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
                        popupTemplate: {
                            title: layer.title + '<div style="display:none">{*}</div>',
                            content: utilities.PopupFormat,
                            actions: [{
                                title: "Open Report",
                                id: "open-report",
                                className: "esri-icon-table"
                            }]
                        },
                        outFields: layer.outFields || ["*"],
                        opacity: layer.opacity,
                        labelingInfo: layer.labelClass ? [layer.labelClass] : undefined
                    });
                } else if (layer.type === "image" && layer.id !== "blockGroups") {
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
                } else if (layer.type === "tile") {
                    if (layer.url) {
                        url = layer.url;
                    }
                    var layerToAdd = new TileLayer({
                        url: url,
                        id: layer.id,
                        opacity: layer.opacity || 1,
                        title: layer.title,
                        visible: layer.visible
                    });
                }
                if (layerToAdd) {
                    layersToAdd.push(layerToAdd);
                    // layerToAdd["sortOrder"] = layer.drawOrder;
                }
            });



            var gfxLayer = new GraphicsLayer({
                id: "gfxLayer"
            });
            mapsutils.map.add(gfxLayer);

            let bufferGraphicsLayer = new GraphicsLayer({
                id: "bufferGraphics"
            });
            mapsutils.map.layers.add(bufferGraphicsLayer);

            mapsutils.map.layers.addMany(layersToAdd);
            // layersToAdd.sort(function(a, b) {
            //     return b.sortOrder - a.sortOrder;
            // });


            //For now.... I'm waiting until the block groups layer is finished to publish the layers-added event.
            //TODO: This should prevent the legend from trying to load to early.
            //It Should probably be refactored at some point
            let bgLayer = mapsutils.map.findLayerById("blockGroups");
            var once = false;
            mapsutils.view.whenLayerView(bgLayer).then(function (lyrView) {
                lyrView.watch("updating", function (value) {
                    if (!value && !once) {
                        appUtils.hideLoading('.loading-container');
                        // blockGroupLyrView = lyrView;
                        tp.publish("layers-added");
                        once = true;
                    }
                });
            });


            var onc = false;
            mapsutils.view.whenLayerView(gfxLayer).then(function (lyrView) {
                lyrView.watch("updating", function (value) {
                    if (!value && !onc) {
                        tp.publish("gfxLayer-loaded");
                    }
                })
            })

            var maxExtent = new Extent({
                xmax: -12014782.270383481,
                xmin: -12867208.009819541,
                ymax: 4497591.978076571,
                ymin: 3571786.6914867624,
                spatialReference: 102100
            });

            mapsutils.view.watch('extent', function (extent) {
                let currentCenter = extent.center;
                if (!maxExtent.contains(currentCenter)) {
                    let newCenter = extent.center;
                    if (currentCenter.x < maxExtent.xmin) {
                        newCenter.x = maxExtent.xmin;
                    }
                    if (currentCenter.x > maxExtent.xmax) {
                        newCenter.x = maxExtent.xmax;
                    }
                    if (currentCenter.y < maxExtent.ymin) {
                        newCenter.y = maxExtent.ymin;
                    }
                    if (currentCenter.y > maxExtent.ymax) {
                        newCenter.y = maxExtent.ymax;
                    }

                    let newExtent = mapsutils.view.extent.clone();
                    newExtent.centerAt(newCenter);
                    mapsutils.view.extent = newExtent;
                }
            });
        }
    }
});