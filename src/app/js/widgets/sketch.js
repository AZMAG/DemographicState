require([
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
        // app.map.add(newGfxLay);
        // var sketch = new Sketch({
        //     layer: newGfxLay,
        //     view: app.view
        // });
        // app.view.ui.add(sketch, "bottom-right");
    })
})
