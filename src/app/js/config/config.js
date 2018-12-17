app.config = {
    Version: "v3.2.4 | 2018-04-20",
    copyright: "2018",

    LegendSource: "American Community Survey 2012-2016 5yr",
    emailLink: "https://www.azmag.gov/Contact/4788?s=geo.azmag.gov/maps/azdemographics&n=Jason%20Howard&popUp=true",

    ArcGISInstanceURL: "https://geo.azmag.gov/gismag/rest",
    exportWebMapUrl: "https://geo.azmag.gov/gismag/rest/services/gp/stateDemo/GPServer/Export%20Web%20Map",

    mainUrl: "https://geo.azmag.gov/gismag/rest/services/maps/DemographicState2016/MapServer",
    siteUrl: "https://geo.azmag.gov/maps/azdemographics/?",

    googleCivicInfoApiKey: "AIzaSyCicS2bzJk_ptthYD2nSu4tIPfjGYmxU1U",

    DefaultColorRamp: "GnBu",
    DefaultColorScheme: "Sequential",
    DefaultNumberOfClassBreaks: 5,

    seriesColors: ["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F", "#FF7F00", "#CAB2D6", "#6A3D9A", "#FFFF99", "#B15928"],
    layerDef: {},
    // {

    //     drawOrder: 0,
    //     legend: true,
    //     id: "censusTracts",
    //     title: "Census Tracts",
    //     type: "feature",
    //     url: this.mainUrl,
    //     queryWhere: "1=1",
    //     layers: [23, 24],
    //     opacity: 1,
    //     visible: true,
    //     showReport: false,
    //     showTOC: true,
    //     showLegend: true,
    //     link: false
    // },
    layers: [{
            drawOrder: 2,
            legend: true,
            id: "cogBoundaries",
            layerName: "Cogs_Mpos",
            title: "COG / MPO Boundaries",
            displayField: "NAME",
            type: "feature",
            queryWhere: "1=1",
            opacity: 0.7,
            visible: false,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: true
        }, {
            drawOrder: 1,
            legend: true,
            id: "countyBoundaries",
            title: "County Boundaries",
            layerName: "Counties",
            displayField: "NAME",
            type: "feature",
            queryWhere: "1=1",
            opacity: 0.8,
            visible: true,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: true
        }, {
            drawOrder: 3,
            legend: true,
            layerName: "Congressional_Districts",
            googleCivic: {
                id: "/cd:",
                valueField: "CD115FP"
            },
            displayField: "NAME",
            id: "congressionalDistricts",
            title: "Congressional Districts",
            type: "feature",
            queryWhere: "1=1",
            opacity: 1,
            visible: false,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: true
        }, {
            drawOrder: 4,
            legend: true,
            layerName: "Legislative_Districts",
            id: "legislativeDistricts",
            title: "Legislative Districts",
            displayField: "NAME",
            type: "feature",
            queryWhere: "1=1",
            opacity: 1,
            visible: false,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: true
        }, {
            drawOrder: 5,
            legend: true,
            layerName: "Zip_Codes",
            id: "zipCodes",
            title: "ZIP Codes",
            displayField: "NAME",
            type: "feature",
            queryWhere: "1=1",
            opacity: 1,
            visible: false,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: true
        },
        //  {
        //     drawOrder: 6,
        // legend: true,
        //     id: "districts",
        //     title: "Unified School Districts",
        //     url: this.mainUrl + "/25",
        //     type: "feature",
        //     queryWhere: "1=1",
        //     opacity: 1,
        //     visible: false,
        //     showReport: true,
        //     selectable: true,

        //     showTOC: true,
        //     link: false
        // }, 
        {
            drawOrder: 7,
            legend: true,
            layerName: "SupervisorDistricts",
            // googleCivic: {
            //     id: "/place:phoenix/council_district:",
            //     valueField: "NAME"
            // },
            id: "supervisorDistricts",
            title: "County Supervisor Districts",
            type: "feature",
            queryWhere: "1=1",
            opacity: 1,
            visible: false,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: false
        }, {
            drawOrder: 7,
            layerName: "CityDistricts",
            googleCivic: {
                id: "/place:phoenix/council_district:",
                valueField: "NAME"
            },
            id: "councilDistricts",
            title: "Council Districts",
            type: "feature",
            queryWhere: "1=1",
            opacity: 1,
            visible: false,
            showReport: true,
            selectable: true,
            showTOC: true,
            link: false
        }, {
            drawOrder: 7,
            id: "esriReference",
            title: "Streets",
            type: "tile",
            url: "http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer",
            visible: true,
            showReport: false,
            showTOC: true,
            legend: false
        }, {
            drawOrder: 8,
            legend: true,
            id: "blockGroups",
            title: "American Community Survey by Block Group, 2012-2016 5yr",
            type: "image",
            layerName: "Block_Groups",
            opacity: 0.8,
            visible: true,
            showReport: false,
            showTOC: false,
            link: false
        }
    ],

    initExtent: {
        "xmin": -13271172.93,
        "ymin": 3506737.09,
        "xmax": -11501054.53,
        "ymax": 4612403.73,
        "spatialReference": {
            "wkid": 102100
        }
    },

    //from colorbrewer 2.0 qualitative HEX Paired
    seriesColors: ["#A6CEE3", "#1F78B4", "#B2DF8A", "#33A02C", "#FB9A99", "#E31A1C", "#FDBF6F", "#FF7F00", "#CAB2D6", "#6A3D9A", "#FFFF99", "#B15928"],

    URLMinimizer: {
        login: "vwolfley",
        apiKey: "R_8dbab4a2f0664e8f8b4f88fe0d9d7f80"
    },

    // ------------------------------
    // MARKUP TOOL SETTINGS
    // ------------------------------

    // Specify the Markup / drawing tools.
    markupToolTreeNodes: [{
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
    }],

    // Specify the Markup Tool's Fill and Outline Kendo Color Pallettes.
    fillColorPalette: ["rgba(163, 73, 164, .50)", "rgba(63, 72, 204, .5)", "rgba(0, 162, 232, 0.50)",
        "rgba(34, 177, 76, 0.50)", "rgba(255, 242, 0, 0.50)", "rgba(255, 127, 39, 0.50)",
        "rgba(237, 28, 36, 0.50)", "rgba(136, 0, 21, 0.50)", "rgba(127, 127, 127, 0.50)", "rgba(0, 0, 0, 0.50)"
    ],

    fillColorOpacity: 0.75,

    outlineColorPalette: ["rgba(163, 73, 164, 1.0)", "rgba(63, 72, 204, 1.0)", "rgba(0, 162, 232, 1.0)",
        "rgba(34, 177, 76, 1.0)", "rgba(255, 242, 0, 1.0)", "rgba(255 ,127, 39, 1.0)",
        "rgba(237, 28, 36, 1.0)", "rgba(136, 0, 21, 1.0)", "rgba(127, 127, 127, 1.0)", "rgba(0, 0, 0, 1.0)"
    ],

    outlineColorOpacity: 1.0,

    textSymbolFontSizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 50],

    sourceLabel: "Source: United States Census Bureau, American Community Survey 2012-2016 5yr Estimates",

    sourceLabel2: "Source: United States Census Bureau, 2010 Decennial Census",

    legalACSDisclaimer: 'Source: U.S. Census Bureau, 2012-2016 American Community Survey (ACS) 5-Year Estimates. ACS data are based on a sample and are subject to sampling variability.  The degree of uncertainty for an estimate is represented through the use of a margin of error (MOE).  In addition to sampling variability, the ACS estimates are subject to nonsampling error. The MOE and effect of nonsampling error is not represented in these tables. Supporting documentation on subject definitions, data accuracy, and statistical testing can be found on the American Community Survey website (www.census.gov/acs) in the Data and Documentation section. Sample size and data quality measures (including coverage rates, allocation rates, and response rates) can be found on the American Community Survey website (www.census.gov/acs) in the Methodology section.  The MOE for individual data elements can be found on the American FactFinder website (factfinder2.census.gov).  Note: Although the ACS produces population, demographic and housing unit estimates, the 2010 Census provides the official counts of the population and housing units for the nation, states, counties, cities and towns.  Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300',

    legalCensusDisclaimer: 'Source: United States Census Bureau, 2010 Decennial Census. Additional information about the 2010 Decennial Cenuss can be found on the US Census Bureau website at www.census.gov/2010census. Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300'
}; //End Config
