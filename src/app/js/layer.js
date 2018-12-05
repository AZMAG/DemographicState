require([
    "esri/layers/FeatureLayer",
    "esri/layers/MapImageLayer",
    "esri/layers/GraphicsLayer",
    "esri/PopupTemplate",
    "dojo/topic",
],
    function (FeatureLayer, MapImageLayer, GraphicsLayer, PopupTemplate, tp) {

        tp.subscribe("map-loaded", addLayers);



    });
