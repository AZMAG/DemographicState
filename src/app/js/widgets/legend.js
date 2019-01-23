"use strict";
require([
    'esri/widgets/Legend',
    'dojo/topic',
    'dojo/domReady!'],
    function (
        Legend,
        tp
    ) {
        tp.subscribe('layers-added', function () {
            // TODO: Make Sure the dom gets correctly cached for this file.

            //Legend
            let legend = $('#legend');
            app.view.ui.add('legend', 'top-right');

        //Create Block Group legend separately
        //Have to do this otherwise it makes the block group legend go to the bottom when other items are checked

        var blockGroupsLayer = app.map.findLayerById('blockGroups');

        new Legend({
            view: app.view,
            container: 'legendDiv',
            layerInfos: [{
                title: '', //app.config.layerDef['blockGroups'].title,
                layer: blockGroupsLayer
            }]
        });

            let initOpacity = .8;

            if (app.initConfig && app.initConfig.transparency !== undefined) {
                initOpacity = app.initConfig.transparency;
                blockGroupsLayer.opacity = app.initConfig.transparency;
            }

        //Add Slider
        $('#legendDiv').append(`
                <span class="legendSrc legal">${app.config.layerDef['blockGroups'].title}</span>
                <div class="slidecontainer">
                    <span style="padding: 8px;">Transparency</span>
                    <input type="range" min="0" max="1" value="${initOpacity}" step=".05" class="round slider" id="slider">
                    <span id="sliderLabel">${initOpacity * 100}%</span>
                </div>
            `);
            $('#slider').on('input', function () {
                blockGroupsLayer.opacity = this.value;
                $('#sliderLabel').html(`${Math.floor(this.value * 100)}%`);
                // alert(this.value)
            });

            let layerInfos = [];
            app.config.layers
                .sort((a, b) => {
                    return a.drawOrder - b.drawOrder;
                })
                .forEach(conf => {
                    if (conf.legend && conf.id !== 'blockGroups') {
                        layerInfos.push({
                            title: conf.title,
                            layer: app.map.findLayerById(conf.id)
                        });
                    }
                });

            new Legend({
                view: app.view,
                container: 'legendDiv',
                layerInfos: layerInfos
            });

            $('#legend').draggable({
                handle: '#legendHeader',
                // scroll: false,
                containment: '#container',
                cursor: 'move'
            });

            $('.customWidget').show();

            if (window.innerWidth < 800 || (app.initConfig && app.initConfig.legend === false)) {
                $('#legend').hide();
                // $(".legendToggle").removeAttr('checked');
            }
        });
    });
