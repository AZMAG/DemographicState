/**
 *  layerInfo:
 *       id = layer unique identifier
 *       title = display title as used in the interface
 *       category = layer category - displayed at top of each layer group
 *       url = layer url
 *       type = [dynamic | tile | wms] - type of layer definition
 *       historical = [true | false] - True if the layer is a historical layer
 *       version = (WMS only) WMS version number
 *       visible = [true | false] default layer visibility
 *       isBasemap = [true | false] layer is considered a basemap (displayed in basemap control)
 *       query = url used for query operations
 *       queryWhere = default where clause used for query operations
 *       layers = array of layer indicies (from MXD) activated when layer is checked "on"
 *       selectable = [true | false] layer is available in sketch dropdown list
 *       layerDefFields = array of fields used for definition query text inputs
 *           - type = ['list'] type of input
 *           - label = label displayed to the user
 *           - fields = array of fields used in query where clause (ex: {name: 'FIELDNAME', numeric:[true|false]} )
 *           - list = array of dropdown list items (ex: {"id": 0, "OCEAN": 'AL', "YEAR": 2012, "DEPRESSION": 18, "LABEL": 'Sandy'})
 *               - Must have property entry for each object in fields array.  'label' property is reserved for display to user
 *           - numeric = [true | false] indicates whether field is numeric or not
 *       opacity = default layer opacity
 *       token = token used for secure service access
 *       filters = array of layer filters / sublayers
 *           - category = filter category (title displayed for each group)
 *           - type = [exp | layer]
 *           - name = label displayed next to filter checkbox
 *           - layers = array of layer indicies (MXD) associated with checkbox
 *           - expression = definition expression associated with filter
 *           - visible = default selection / visibility of filter
 **/

var appConfig = new function() {

        this.Version = "v1.1.0 | 11/3/2014";

        this.ArcGISInstanceURL = "http://geo.azmag.gov/gismag/rest";
        //this.exportWebMapUrl = "http://geo.azmag.gov/gismag/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";  // Generic Print Service
        this.exportWebMapUrl = "http://geo.azmag.gov/gismag/rest/services/gp/stateDemo/GPServer/Export%20Web%20Map";  // Custom Print Service
        this.webServicePasscode = "sun sand dry heat grand canyon";

        this.jasonemail = "https://www.azmag.gov/EmailPages/JasonHoward.asp";

        this.layerInfo = [
            {
                id: "census tracts",
                title: "Census Tract Labels",
                type: "dynamic",
                url: "http://geo.azmag.gov/gismag/rest/services/maps/StatewideDemographic_TractBounds/MapServer",
                queryUrl: "http://geo.azmag.gov/gismag/rest/services/maps/StatewideDemographic_TractBounds/MapServer/0",
                queryWhere: "1=1",
                layers: [0, 1],
                opacity: 1,
                visible: false,
                selectable: true,
                filters: [],
                showTOC: true
            },        
          
            {
                id: "county boundaries",
                title: "County Boundaries",
                type: "dynamic",
                url: "http://geo.azmag.gov/gismag/rest/services/maps/StatewideDemographics/MapServer",
                queryUrl: "http://geo.azmag.gov/gismag/rest/services/maps/StatewideDemographics/MapServer/2",
                queryWhere: "1=1",
                layers: [2],
                opacity: 0.8,
                visible: true,
                selectable: false,
                filters: [],
                showTOC: true
            },
              {
                id: "reference",
                title: "Roads",
                type: "tile",
                url: "http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer",
                visible: true,
                showTOC: true
            },
        
            {
                id: "Census2010byBlockGroup",
                title: "Census by Block Group, 2010",
                type: "dynamic",
                url: "http://geo.azmag.gov/gismag/rest/services/maps/StatewideDemographics/MapServer",
                layers: [0],
                opacity: 0.8,
                visible: true,
                showTOC: false
            },
          
            {
                id: "esriImagery",
                title: "Aerial",
                type: "tile",
                url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                visible: false,
                showTOC: true
            },
            {
                id: "MagBasemapUnder_3",
                title: "Terrain",
                url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer",
                type: "tile",
                visible: true,
                isBasemap: true,
                showTOC: true
            }
              
        ]; // End layerInfo

    //levels of detail
        this.lods = [

            {"level" : 7, "resolution" : 1222.99245256249, "scale": 4622324.434309},
            {"level" : 8, "resolution" : 611.49622628138, "scale" : 2311162.217155},
            {"level" : 9, "resolution" : 305.748113140558, "scale" : 1155581.108577},
            {"level" : 10, "resolution" : 152.874056570411, "scale" : 577790.554289},
            {"level" : 11, "resolution" : 76.4370282850732, "scale" : 288895.277144},
            {"level" : 12, "resolution" : 38.2185141425366, "scale" : 144447.638572},
            {"level" : 13, "resolution" : 19.1092570712683, "scale" : 72223.819286},
            {"level" : 14, "resolution" : 9.55462853563415, "scale" : 36111.909643},
            {"level" : 15, "resolution" : 4.77731426794937, "scale" : 18055.954822},
            {"level" : 16, "resolution" : 2.38865713397468, "scale" : 9027.977411},
            {"level" : 17, "resolution" : 1.19432856685505, "scale" : 4513.988705},
            {"level" : 18, "resolution" : 0.597164283559817, "scale" : 2256.994353},
            {"level" : 19, "resolution" : 0.298582141647617, "scale" : 1128.497176}
        ];

        this.initExtent = {
            "xmin": -13271172.93,
            "ymin": 3506737.09,
            "xmax": -11501054.53,
            "ymax": 4612403.73,
            "spatialReference": {
                "wkid": 102100
            }
        };

        //from colorbrewer 2.0 qualitative HEX Paired
        this.seriesColors = ["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F", "#FF7F00", "#CAB2D6", "#6A3D9A", "#FFFF99", "#B15928"];
        //from colorbrewer 2.0 qualitative HEX Set3
        //this.seriesColors = ["#8DD3C7", "#FFFFB3", "#BEBADA", "#FB8072", "#80B1D3", "#FDB462", "#B3DE69", "#FCCDE5", "#D9D9D9", "#BC80BD", "#CCEBC5", "#FFED6F"];


    };//End Config