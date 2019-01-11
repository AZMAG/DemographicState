app.config = {
    Version: 'v4.0.0 | 2019-01-09',
    copyright: '2019',

    LegendSource: 'American Community Survey 2013-2017 5yr',
    emailLink: 'https://www.azmag.gov/Contact/4788?s=geo.azmag.gov/maps/azdemographics&n=Jason%20Howard&popUp=true',

    ArcGISInstanceURL: 'https://geo.azmag.gov/gismag/rest',
    exportWebMapUrl: 'https://geo.azmag.gov/gismag/rest/services/gp/stateDemo/GPServer/Export%20Web%20Map',

    mainUrl: 'https://geo.azmag.gov/gismag/rest/services/maps/DemographicState2017/MapServer',
    siteUrl: 'https://geo.azmag.gov/maps/azdemographics/?',

    googleCivicInfoApiKey: 'AIzaSyCicS2bzJk_ptthYD2nSu4tIPfjGYmxU1U',
    googleCivicOffices: [
        'Mayor',
        'Supervisors District',
        'United States House of Representatives',
        'Council, District'
    ],

    DefaultColorRamp: 'GnBu',
    DefaultColorScheme: 'Sequential',
    DefaultNumberOfClassBreaks: 5,

    layerDef: {},
    layers: [
        {
            legend: true,
            id: 'blockGroups',
            layerName: 'Block_Groups',
            title: 'American Community Survey by Block Group, 2013-2017 5yr',
            type: 'image',
            opacity: 0.8,
            visible: true,
            showReport: false,
            showTOC: false
        },
        {
            legend: false,
            id: 'esriReference',
            layerName: '',
            title: 'Streets',
            type: 'tile',
            opacity: 1,
            visible: true,
            showReport: false,
            showTOC: true,
            url: 'http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer'
        },
        {
            legend: true,
            id: 'councilDistricts',
            layerName: 'CityDistricts',
            title: 'Council Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'supervisorDistricts',
            layerName: 'SupervisorDistricts',
            title: 'County Supervisor Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'zipCodes',
            layerName: 'Zip_Codes',
            title: 'ZIP Codes',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'legislativeDistricts',
            layerName: 'Legislative_Districts',
            title: 'Legislative Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'congressionalDistricts',
            layerName: 'Congressional_Districts',
            title: 'Congressional Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'countyBoundaries',
            layerName: 'Counties',
            title: 'County Boundaries',
            type: 'feature',
            opacity: 0.8,
            visible: true,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'cogBoundaries',
            layerName: 'Cogs_Mpos',
            title: 'COG / MPO Boundaries',
            type: 'feature',
            opacity: 0.7,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'places',
            layerName: 'Places',
            title: 'Places',
            type: 'feature',
            opacity: 0.8,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'state',
            layerName: 'State',
            title: 'State',
            type: 'feature',
            opacity: 0.08,
            visible: false,
            showReport: true,
            showTOC: true
        },
        {
            legend: true,
            id: 'opportunityZones',
            layerName: 'OpportunityZones',
            title: 'Opportunity Zones',
            type: 'feature',
            opacity: 0.08,
            visible: false,
            showReport: true,
            showTOC: true
        }
    ],

    initExtent: {
        xmin: -13271172.93,
        ymin: 3506737.09,
        xmax: -11501054.53,
        ymax: 4612403.73,
        spatialReference: {
            wkid: 102100
        }
    },

    //from colorbrewer 2.0 qualitative HEX Paired
    seriesColors: [
        '#1f78b4',
        '#a6cee3',
        '#b2df8a',
        '#33a02c',
        '#fb9a99',
        '#e31a1c',
        '#fdbf6f',
        '#ff7f00',
        '#cab2d6',
        '#6a3d9a',
        '#ffff99',
        '#b15928'
    ],

    URLMinimizer: {
        login: 'vwolfley',
        apiKey: 'R_8dbab4a2f0664e8f8b4f88fe0d9d7f80'
    },

    // ------------------------------
    // MARKUP TOOL SETTINGS
    // ------------------------------

    // Specify the Markup / drawing tools.
    markupToolTreeNodes: [
        {
            id: 1,
            text: 'Polygon',
            DisplayText: 'Polygon',
            Type: 'POLYGON',
            imageUrl: 'app/resources/img/i_draw_poly.png'
        },
        {
            id: 2,
            text: 'Circle',
            DisplayText: 'Circle',
            Type: 'CIRCLE',
            imageUrl: 'app/resources/img/i_draw_circle.png'
        },
        {
            id: 3,
            text: 'Arrow',
            DisplayText: 'Arrow',
            Type: 'ARROW',
            imageUrl: 'app/resources/img/i_draw_arrow.png'
        },
        {
            id: 4,
            text: 'Freehand',
            DisplayText: 'Freehand',
            Type: 'FREEHAND_POLYGON',
            imageUrl: 'app/resources/img/i_draw_freepoly.png'
        },
        {
            id: 5,
            text: 'Text',
            DisplayText: 'Text Box',
            Type: 'POINT',
            imageUrl: 'app/resources/img/i_draw_text.png'
        }
    ],

    // Specify the Markup Tool's Fill and Outline Kendo Color Pallettes.
    fillColorPalette: [
        'rgba(163, 73, 164, .50)',
        'rgba(63, 72, 204, .5)',
        'rgba(0, 162, 232, 0.50)',
        'rgba(34, 177, 76, 0.50)',
        'rgba(255, 242, 0, 0.50)',
        'rgba(255, 127, 39, 0.50)',
        'rgba(237, 28, 36, 0.50)',
        'rgba(136, 0, 21, 0.50)',
        'rgba(127, 127, 127, 0.50)',
        'rgba(0, 0, 0, 0.50)'
    ],

    fillColorOpacity: 0.75,

    outlineColorPalette: [
        'rgba(163, 73, 164, 1.0)',
        'rgba(63, 72, 204, 1.0)',
        'rgba(0, 162, 232, 1.0)',
        'rgba(34, 177, 76, 1.0)',
        'rgba(255, 242, 0, 1.0)',
        'rgba(255 ,127, 39, 1.0)',
        'rgba(237, 28, 36, 1.0)',
        'rgba(136, 0, 21, 1.0)',
        'rgba(127, 127, 127, 1.0)',
        'rgba(0, 0, 0, 1.0)'
    ],

    outlineColorOpacity: 1.0,

    textSymbolFontSizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 50],

    sourceLabel: 'Source: United States Census Bureau, American Community Survey 2013-2017 5yr Estimates',

    sourceLabel2: 'Source: United States Census Bureau, 2010 Decennial Census',

    legalACSDisclaimer:
        'Source: U.S. Census Bureau, 2013-2017 American Community Survey (ACS) 5-Year Estimates. ACS data are based on a sample and are subject to sampling variability.  The degree of uncertainty for an estimate is represented through the use of a margin of error (MOE).  In addition to sampling variability, the ACS estimates are subject to nonsampling error. The MOE and effect of nonsampling error is not represented in these tables. Supporting documentation on subject definitions, data accuracy, and statistical testing can be found on the American Community Survey website (www.census.gov/acs) in the Data and Documentation section. Sample size and data quality measures (including coverage rates, allocation rates, and response rates) can be found on the American Community Survey website (www.census.gov/acs) in the Methodology section.  The MOE for individual data elements can be found on the American FactFinder website (factfinder2.census.gov).  Note: Although the ACS produces population, demographic and housing unit estimates, the 2010 Census provides the official counts of the population and housing units for the nation, states, counties, cities and towns.  Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300',

    legalCensusDisclaimer:
        'Source: United States Census Bureau, 2010 Decennial Census. Additional information about the 2010 Decennial Cenuss can be found on the US Census Bureau website at www.census.gov/2010census. Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300'
}; //End Config
