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

    this.Version = "v3.0.6 | 04/14/2017";
    this.LegendSource = "American Community Survey 2012-2016 5yr";
    this.jasonemail = "http://www.azmag.gov/Contact/4788?s=geo.azmag.gov/maps/azdemographics&n=Jason%20Howard&popUp=true";

    this.ArcGISInstanceURL = "http://geo.azmag.gov/gismag/rest";
    //this.exportWebMapUrl = "http://geo.azmag.gov/gismag/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task";  // Generic Print Service
    this.exportWebMapUrl = "http://geo.azmag.gov/gismag/rest/services/gp/stateDemo/GPServer/Export%20Web%20Map"; // Custom Print Service
    this.webServicePasscode = "sun sand dry heat grand canyon";

    this.mainURL = "http://geo.azmag.gov/gismag/rest/services/Test/DemographicState2016/MapServer";
    this.siteUrl = "http://geo.azmag.gov/maps/azdemographics/?";

    // Search Service URLs
    this.geoCoderService = "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
    this.tractService = this.mainURL + "/23";
    this.SchoolsService = this.mainURL + "/25";

    this.layerInfo = [{
        drawOrder: 0,
        id: "censusTracts",
        title: "Census Tracts",
        type: "dynamic",
        url: this.mainURL,
        queryUrl: this.mainURL + "/24",
        queryWhere: "1=1",
        layers: [23, 24],
        opacity: 1,
        visible: false,
        showTOC: true,
        link: false
    }, {
        drawOrder: 2,
        id: "cogBoundaries",
        layerName: "Cogs_Mpos",
        title: "COG / MPO Boundaries",
        type: "feature",
        queryWhere: "1=1",
        opacity: 0.7,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: true
    }, {
        drawOrder: 1,
        id: "countyBoundaries",
        title: "County Boundaries",
        layerName: "Counties",
        type: "feature",
        queryWhere: "1=1",
        opacity: 0.8,
        visible: true,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: true
    }, {
        drawOrder: 3,
        layerName: "Congressional_Districts",
        id: "congressionalDistricts",
        title: "Congressional Districts",
        type: "feature",
        queryWhere: "1=1",
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: true
    }, {
        drawOrder: 4,
        layerName: "Legislative_Districts",
        id: "legislativeDistricts",
        title: "Legislative Districts",
        type: "feature",
        queryWhere: "1=1",
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: true
    }, {
        drawOrder: 5,
        layerName: "Zip_Codes",
        id: "zipCodes",
        title: "ZIP Codes",
        type: "feature",
        queryWhere: "1=1",
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: true
    }, {
        drawOrder: 6,
        id: "districts",
        title: "Unified School Districts",
        url: this.mainURL + "/25",
        queryUrl: this.mainURL + "/25",
        type: "feature",
        queryWhere: "1=1",
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: false
    }, {
        drawOrder: 7,
        layerName: "SupervisorDistricts",
        id: "supervisorDistricts",
        title: "Supervisor Districts",
        type: "feature",
        queryWhere: "1=1",
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: false
    }, {
        drawOrder: 7,
        layerName: "CityDistricts",
        id: "councilDistricts",
        title: "Council Districts",
        type: "feature",
        queryWhere: "1=1",
        opacity: 1,
        visible: false,
        selectable: true,
        outFields: ["*"],
        filters: [],
        showTOC: true,
        link: false
    }, {
        drawOrder: 7,
        id: "esriReference",
        title: "Streets",
        type: "tile",
        url: "http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer",
        visible: true,
        showTOC: true
    }, {
        drawOrder: 8,
        id: "blockGroups",
        title: "American Community Survey by Block Group, 2012-2016 5yr",
        type: "dynamic",
        url: this.mainURL,
        layers: [0],
        opacity: 0.8,
        visible: true,
        showTOC: false,
        link: false,
        populateDropDown: false
    }, {
        drawOrder: 9,
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
        drawOrder: 10,
        id: "esriImagery",
        title: "Imagery",
        type: "tile",
        url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        isBasemap: true,
        visible: false,
        showTOC: true
    }];

    // function toObject(arr) {
    //     var rv = {};
    //     for (var i = 0; i < arr.length; ++i)
    //         rv[arr[i].id] = arr[i];
    //     return rv;
    // }


    // this.layerInfoObj = toObject(this.layerInfo);
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

    this.bubbleColors = [{
        category: "MgBizFin",
        color: "#A6CEE3"
    }, {
        category: "CompEngSci",
        color: "#1F78B4"
    }, {
        category: "EduLegComArtMedia",
        color: "#B2DF8A"
    }, {
        category: "HealthTechnical",
        color: "#33A02C"
    }, {
        category: "ServiceOcc",
        color: "#FB9A99"
    }, {
        category: "ProtectiveServ",
        color: "#E31A1C"
    }, {
        category: "SalesOfficeOcc",
        color: "#FDBF6F"
    }, {
        category: "NatResources",
        color: "#FF7F00"
    }, {
        category: "ProdTransMaterial",
        color: "#CAB2D6"
    }];

    this.URLMinimizer = {

        login: "vwolfley",
        apiKey: "R_8dbab4a2f0664e8f8b4f88fe0d9d7f80"
    };

    // ------------------------------
    // MARKUP TOOL SETTINGS
    // ------------------------------

    // Specify the Markup / drawing tools.
    this.markupToolTreeNodes = [{
        id: 1,
        text: "Polygon",
        DisplayText: "Polygon",
        Type: "POLYGON",
        imageUrl: "app/resources/img/i_draw_poly.png"
    }, {
        id: 2,
        text: "Circle",
        DisplayText: "Circle",
        Type: "CIRCLE",
        imageUrl: "app/resources/img/i_draw_circle.png"
    }, {
        id: 3,
        text: "Arrow",
        DisplayText: "Arrow",
        Type: "ARROW",
        imageUrl: "app/resources/img/i_draw_arrow.png"
    }, {
        id: 4,
        text: "Freehand",
        DisplayText: "Freehand",
        Type: "FREEHAND_POLYGON",
        imageUrl: "app/resources/img/i_draw_freepoly.png"
    }, {
        id: 5,
        text: "Text",
        DisplayText: "Text Box",
        Type: "POINT",
        imageUrl: "app/resources/img/i_draw_text.png"
    }];

    // Specify the Markup Tool's Fill and Outline Kendo Color Pallettes.
    this.fillColorPalette = ["rgba(163, 73, 164, .50)", "rgba(63, 72, 204, .5)", "rgba(0, 162, 232, 0.50)",
        "rgba(34, 177, 76, 0.50)", "rgba(255, 242, 0, 0.50)", "rgba(255, 127, 39, 0.50)",
        "rgba(237, 28, 36, 0.50)", "rgba(136, 0, 21, 0.50)", "rgba(127, 127, 127, 0.50)", "rgba(0, 0, 0, 0.50)"
    ];
    this.fillColorOpacity = 0.75;

    this.outlineColorPalette = ["rgba(163, 73, 164, 1.0)", "rgba(63, 72, 204, 1.0)", "rgba(0, 162, 232, 1.0)",
        "rgba(34, 177, 76, 1.0)", "rgba(255, 242, 0, 1.0)", "rgba(255 ,127, 39, 1.0)",
        "rgba(237, 28, 36, 1.0)", "rgba(136, 0, 21, 1.0)", "rgba(127, 127, 127, 1.0)", "rgba(0, 0, 0, 1.0)"
    ];
    this.outlineColorOpacity = 1.0;

    this.textSymbolFontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 50];

    this.sourceLabel = "Source: United States Census Bureau, American Community Survey 2012-2016 5yr Estimates";

    this.sourceLabel2 = "Source: United States Census Bureau, 2010 Decennial Census";

    this.legalDisclaimer = 'Source: U.S. Census Bureau, 2012-2016 American Community Survey (ACS) 5-Year Estimates. ACS data are based on a sample and are subject to sampling variability.  The degree of uncertainty for an estimate is represented through the use of a margin of error (MOE).  In addition to sampling variability, the ACS estimates are subject to nonsampling error. The MOE and effect of nonsampling error is not represented in these tables. Supporting documentation on subject definitions, data accuracy, and statistical testing can be found on the American Community Survey website (www.census.gov/acs) in the Data and Documentation section. Sample size and data quality measures (including coverage rates, allocation rates, and response rates) can be found on the American Community Survey website (www.census.gov/acs) in the Methodology section.  The MOE for individual data elements can be found on the American FactFinder website (factfinder2.census.gov).  Note: Although the ACS produces population, demographic and housing unit estimates, the 2010 Census provides the official counts of the population and housing units for the nation, states, counties, cities and towns.  Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300';

}; //End Config
