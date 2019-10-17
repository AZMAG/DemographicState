"use strict";
define([
    "esri/widgets/Sketch",
    "esri/Map",
    "esri/layers/GraphicsLayer",
    "esri/views/MapView",
    "dojo/topic"
], function (
    Sketch, Map, GraphicsLayer, MapView, tp
) {
    tp.subscribe("map-loaded", function () {
        // let newGfxLay = new GraphicsLayer({
        //     id: 'sketchGfx'
        // })
        // mapsutils.map.add(newGfxLay);
        // var sketch = new Sketch({
        //     layer: newGfxLay,
        //     view: mapsutils.view
        // });
        // mapsutils.view.ui.add(sketch, "bottom-right");
    });
});
