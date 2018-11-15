//This file listens for any changes to color ramps, number of class breaks, 
//or map changes and updates the block groups renderer.
require([
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (tp) {

        //Cache DOM
        let $classType = $("#classType");
        let $colorRamp = $("#colorRamp");
        let $classBreaksCount = $("#classBreaksCount");

        $classType.change(function () {
            let type = $(this).val();
            tp.publish("classType-change", type);
            if (type !== 'Custom') {
                UpdateMapRenderer();
            }
        });

        $classBreaksCount.change(function () {
            tp.publish("classBreaksCount-change");
        });

        //TODO this seems to be too big of a function.  
        //Separate some of the functionality out.
        function UpdateMapRenderer(customBreaks) {

            let cbInfos = [];

            let data = app.GetCurrentMapsParams();

            console.log(data);


            // let conf = app.GetActiveMapData();

            //Get current number of breaks
            // let numBreaks = $classBreaksCount.val() || app.config.DefaultNumberOfClassBreaks;

            //Get type
            // let breaksType = $classType.val() || "Jenks";

            // if (breaksType !== 'Custom') {

            //Pull correct breaks from active item config
            // let breaks = conf.breaks[breaksType + numBreaks];

            //Get color ramp info
            // let rampKey = $colorRamp.find(".cRamp").data("id") || app.config.DefaultColorRamp;
            // let type = $colorRamp.find(".cRamp").data("type") || app.config.DefaultColorScheme;

            //Get a color ramp using above data
            // let colorRamp = app.GetColorRamp(type, rampKey, numBreaks);

            // if (customBreaks && customBreaks.length) {
            //     cbInfos = customBreaks;
            // } else {
            //     cbInfos = app.GetCurrentBreaks(breaks, colorRamp);
            // }

            //Construct renderer object
            let renderer = {
                type: "class-breaks",
                field: data.conf.FieldName,
                normalizationField: data.conf.NormalizeField,
                classBreakInfos: data.cbInfos,
                legendOptions: {
                    title: data.conf.ShortName
                }
            };

            if (renderer) {
                //Update the layer with the new renderer.
                let layer = app.map.findLayerById("blockGroups").findSublayerById(0);
                layer.renderer = renderer;
                tp.publish('BlockGroupRendererUpdated', renderer);
            }
            // }
        }

        // Subscribe to other change events
        // and update the renderer when any of them fire.
        tp.subscribe("layers-added", UpdateMapRenderer);
        tp.subscribe("colorRamp-Changed", UpdateMapRenderer);
        tp.subscribe("map-selected", UpdateMapRenderer);
        tp.subscribe("customClassBreaks-selected", UpdateMapRenderer);
        tp.subscribe("classBreaksCount-change", UpdateMapRenderer);
    })
