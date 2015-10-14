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

    this.Version = "v2.0.1 | 10/14/2015";

    this.ArcGISInstanceURL = "http://geo.azmag.gov/gismag/rest";
    //this.exportWebMapUrl = "http://geo.azmag.gov/gismag/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";  // Generic Print Service
    this.exportWebMapUrl = "http://geo.azmag.gov/gismag/rest/services/gp/stateDemo/GPServer/Export%20Web%20Map"; // Custom Print Service
    this.webServicePasscode = "sun sand dry heat grand canyon";

    // Search Service URLs
    this.geoCoderService = "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
    this.countyService = "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/4";
    this.placeService = "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/1";
    this.legislativeService = "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/2";
    this.congressionalService = "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/3";
    this.tractService = "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/7";

    this.jasonemail = "https://www.azmag.gov/EmailPages/JasonHoward.asp";

    this.layerInfo = [{
        layerNum: 0,
        id: "censusTracts",
        title: "Census Tract Labels",
        type: "dynamic",
        url: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer",
        queryUrl: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/8",
        queryWhere: "1=1",
        layers: [7, 8],
        opacity: 1,
        visible: false,
        showTOC: true
    }, {
        layerNum: 1,
        id: "countyBoundaries",
        title: "County Boundaries",
        type: "dynamic",
        url: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer",
        queryUrl: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/4",
        queryWhere: "1=1",
        layers: [4],
        opacity: 0.8,
        visible: true,
        showTOC: true
    }, {
        layerNum: 2,
        id: "congressionalDistricts",
        title: "Congressional Districts",
        type: "feature",
        url: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/6",
        queryUrl: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/6",
        queryWhere: "1=1",
        layers: [6],
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true
    }, {
        layerNum: 3,
        id: "legislativeDistricts",
        title: "Legislative Districts",
        type: "feature",
        url: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/5",
        queryUrl: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer/5",
        queryWhere: "1=1",
        layers: [5],
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true
    }, {
        layerNum: 4,
        id: "esriReference",
        title: "Streets",
        type: "tile",
        url: "http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer",
        visible: true,
        showTOC: true
    }, {
        layerNum: 5,
        id: "Census2010byBlockGroup",
        title: "Census by Block Group, 2010",
        type: "dynamic",
        url: "http://geo.azmag.gov/gismag/rest/services/maps/StateDemographicMain2/MapServer",
        layers: [0],
        opacity: 0.8,
        visible: true,
        showTOC: false
    }, {
        layerNum: 7,
        id: "esriBasemap",
        title: "Terrain",
        type: "tile",
        // url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer",
        // url: "http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer",
        // url: "http://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer",
        url: "http://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer",
        visible: true,
        isBasemap: false,
        showTOC: false
    }, {
        layerNum: 6,
        id: "esriImagery",
        title: "Imagery",
        type: "tile",
        url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        isBasemap: true,
        visible: false,
        showTOC: true
    }];
    // End layerInfo

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

    this.URLMinimizer = {

        login: "vwolfley",
        apiKey: "R_8dbab4a2f0664e8f8b4f88fe0d9d7f80"
    };

}; //End Config