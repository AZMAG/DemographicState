"use strict";
define([
        "mag/config/config",
        "mag/config/initConfig",
        "esri/widgets/Legend",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (
        config,
        initConfig,
        Legend,
        tp
    ) {
        tp.subscribe("layers-added", function () {
            // TODO: Make Sure the dom gets correctly cached for this file.

            //Legend
            let legend = $("#legend");
            app.view.ui.add("legend", "top-right");

            //Create Block Group legend separately
            //Have to do this otherwise it makes the block group legend go to the bottom when other items are checked

            var blockGroupsLayer = app.map.findLayerById("blockGroups");

            new Legend({
                view: app.view,
                container: "bgLegend",
                layerInfos: [{
                    title: "", //config.layerDef["blockGroups"].title,
                    layer: blockGroupsLayer
                }]
            });

            let initOpacity = 0.8;

            if (initConfig.transparency) {
                initOpacity = initConfig.transparency;
                blockGroupsLayer.opacity = initConfig.transparency;
            }

            //Add Slider
            $("#bgLegend").append(`
                <span class="legendSrc legal">${config.layerDef["blockGroups"].title}</span>
                <span style="padding: 8px;">Transparency</span><br>
                <div class="slidecontainer">
                    <input type="range" min="0" max="1" value="${initOpacity}" step=".05" class="round slider" id="slider">
                    <span id="sliderLabel">${initOpacity * 100}%</span>
                </div>
            `);
            $("#slider").on("input change", function () {
                blockGroupsLayer.opacity = this.value;
                $("#sliderLabel").html(`${Math.floor(this.value * 100)}%`);
                // alert(this.value)
            });

            let layerInfos = [];
            config.layers
                .forEach(conf => {
                    if (conf.legend && conf.id !== "blockGroups") {
                        layerInfos.push({
                            title: conf.title,
                            layer: app.map.findLayerById(conf.id)
                        });
                    }
                });

            new Legend({
                view: app.view,
                container: "layerLegend",
                layerInfos: layerInfos
            });

            $("#legend").draggable({
                handle: "#legendHeader",
                // scroll: false,
                containment: "#container",
                cursor: "move"
            });

            $(".customWidget").show();

            if (window.innerWidth < 800 || (!initConfig.legend)) {
                $("#legend").hide();
                // $(".legendToggle").removeAttr("checked");
            }
        });
    });
