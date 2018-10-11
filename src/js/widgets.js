require(["esri/widgets/Home", "esri/Basemap", "esri/widgets/LayerList", "esri/widgets/Zoom", "esri/widgets/BasemapToggle", "esri/layers/TileLayer", "esri/widgets/Legend", "esri/widgets/Locate", "dojo/topic"],
    function (Home, Basemap, LayerList, Zoom, BasemapToggle, TileLayer, Legend, Locate, tp) {
        tp.subscribe("map-loaded", function () {
            var home = new Home({
                view: app.view
            });
            app.view.ui.add(home, "bottom-right");

            // var layerList = new LayerList({
            //     view: app.view,
            //     statusIndicatorsVisible: false,
            //     listItemCreatedFunction: function (event) {
            //         const item = event.item;
            //         console.log(item);
            //         item.panel = {
            //             content: "legend",
            //             open: false
            //         };

            //     }
            // });

            // app.view.ui.add(layerList, "top-right");

            var legend = new Legend({
                view: app.view
            })
            app.view.ui.add(legend, "top-right");

            //About Widget
            // app.view.ui.add("aboutWidget", "bottom-right");

            //Print Widget
            // app.view.ui.add("printWidget", "top-left");

            //Basemap Toggle
            var satLayer = new TileLayer({
                url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
            });

            var base = new Basemap({
                baseLayers: [satLayer],
                title: "Aerial",
                id: "testBasemap",
                thumbnailUrl: "https://js.arcgis.com/4.5/esri/images/basemap/hybrid.jpg"
            });

            var toggle = new BasemapToggle({
                view: app.view,
                nextBasemap: base,
                titleVisible: true
            });

            app.view.ui.add(toggle, "bottom-right");

            //Zoom Widget
            var zoom = new Zoom({
                view: app.view
            });
            app.view.ui.add(zoom, "bottom-right");

            //Locate Widget
            var locateBtn = new Locate({
                viewModel: {
                    view: app.view
                }
            });
            app.view.ui.add(locateBtn, "bottom-right");
        });
    });
