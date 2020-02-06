app.config = {
    version: 'v4.0.8 | 2019-12-03',
    copyright: '2019',

    LegendSource: 'American Community Survey 2014-2018 5yr',
    emailLink: 'https://www.azmag.gov/Contact/4788?s=geo.azmag.gov/maps/azdemographics&n=Jason%20Howard&popUp=true',

    ArcGISInstanceURL: 'https://geo.azmag.gov/arcgis/rest',

    mainUrl: 'https://geo.azmag.gov/arcgis/rest/services/maps/DemographicState2018/MapServer',
    printUrl: 'https://geo.azmag.gov/arcgis/rest/services/gp/Demographic_Print/GPServer/Export%20Web%20Map',
    pdfService: {
        defaultUrl: 'https://geo.azmag.gov/services/demographics2018/Reports.html?',
        compareUrl: 'https://geo.azmag.gov/services/demographics2018/CompareReport.html?'
    },
    siteUrl: 'https://geo.azmag.gov/maps/azdemographics/?',

    googleCivicInfoApiKey: 'AIzaSyCicS2bzJk_ptthYD2nSu4tIPfjGYmxU1U',
    googleCivicOffices: [{
            name: 'Mayor',
            displayValue: 'Mayor'
        },
        {
            name: 'Supervisors District',
            displayValue: 'Supervisor'
        },
        {
            name: 'County Supervisor',
            displayValue: 'Supervisor'
        },
        {
            name: 'United States House of Representatives',
            displayValue: 'US House Representative'
        },
        {
            name: 'Council, District',
            displayValue: 'Council Member'
        },
        {
            name: 'AZ State Senate',
            displayValue: 'AZ Senator'
        },
        {
            name: 'AZ State Senator',
            displayValue: 'AZ Senator'
        },
        {
            name: 'AZ State House',
            displayValue: 'AZ House Representative'
        },
        {
            name: 'U.S. Representative',
            displayValue: 'US House Representative'
        }, {
            name: 'State Representative',
            displayValue: 'AZ State Representative'
        }, {
            name: 'City Council Member',
            displayValue: 'City Council Member'
        }

    ],

    // "name": "Phoenix Mayor",
    // "name": "Maricopa County Supervisor",
    // "name": "Pinal County Supervisor",
    // "name": "Glendale City Council Member",
    // "name": "Phoenix City Council Member",
    // "name": "Glendale City Council Member",
    // "name": "Peoria City Council Member",
    // "name": "AZ State Senator",
    // "name": "AZ State Representative",
    // "name": "U.S. Representative",

    bitly: {
        login: 'vwolfley',
        apiKey: 'R_8dbab4a2f0664e8f8b4f88fe0d9d7f80'
    },

    DefaultColorRamp: 'GnBu',
    DefaultColorScheme: 'Sequential',
    DefaultNumberOfClassBreaks: 5,

    layerDef: {},
    layers: [{
            legend: true,
            id: 'blockGroups',
            layerName: 'Block_Groups',
            title: 'American Community Survey by Block Group, 2014-2018 5 year estimates',
            type: 'image',
            outFields: ["*"],
            opacity: 0.8,
            visible: true,
            showReport: false,
            showTOC: false
        },
        {
            legend: false,
            id: 'streets',
            layerName: '',
            title: 'Streets',
            type: 'tile',
            opacity: 1,
            visible: true,
            showReport: false,
            showTOC: true,
            definition: 'The streets layer adds a transportation layer from ESRI for reference.',
            url: 'http://server.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer',
            layerListOrder: 19
        },
        {
            legend: true,
            id: 'countyBoundaries',
            layerName: 'Counties',
            title: 'Counties',
            type: 'feature',
            opacity: 0.8,
            visible: true,
            showReport: true,
            showTOC: true,
            definition: 'Counties are the primary legal divisions of most states. Most counties are functioning governmental units, whose powers and functions vary from state to state.',
            layerListOrder: 1
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
            showTOC: true,
            definition: 'Here Places are a combination of both Census Incorporated Places and Designated Places. An incorporated Place is established to provide governmental functions for a concentration of people as opposed to a minor civil division, which generally is created to provide services or administer an area without regard, necessarily, to population. Census Designated Places (CDPs) are the statistical counterparts of incorporated places, and are delineated to provide data for settled concentrations of population that are identifiable by name but are not legally incorporated under the laws of the state in which they are located.   The boundaries usually are defined in cooperation with local or tribal officials and generally updated prior to each decennial census. ',
            layerListOrder: 2
        },
        {
            legend: true,
            id: 'aiaAreas',
            layerName: 'AmericanIndianAreas',
            title: 'American Indian Areas',
            type: 'feature',
            opacity: 0.8,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'Census geographic entities that cover areas of American Indian and Alaska Native settlements, collectively termed American Indian and Alaska Native areas(AIANAs).The major types of AIANAs are American Indian reservations and trust lands, tribal jurisdiction statistical areas(TJSAs), Alaska Native Regional Corporations(ANRCs), Alaska Native village statistical areas(ANVSAs), and tribal designated statistical areas(TDSAs).',
            layerListOrder: 3
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
            showTOC: true,
            definition: 'ZIP Code Tabulation Areas (ZCTAs) are statistical entities developed by the United States Census Bureau for tabulating summary statistics. These were introduced with the Census 2000 and continued with the 2010 Census. This new entity was developed to overcome the difficulties in precisely defining the land area covered by each ZIP code. Defining the extent of an area is necessary in order to tabulate census data for that area.',
            layerListOrder: 4,
            labelClass: {
                labelExpressionInfo: {
                    expression: '$feature.NAME'
                },
                symbol: {
                    type: 'text',
                    color: 'black',
                    haloSize: 2,
                    haloColor: 'white'
                },
                minScale: 577790
            }

        },
        {
            legend: true,
            id: 'supervisorDistricts',
            layerName: 'SupervisorDistricts',
            displayFields: ['COUNTY', 'NAME'],
            title: 'County Supervisor Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'A board of supervisors is a governing body that oversees the operation of county government in the American states of Arizona, California, Iowa, Mississippi, Virginia, and Wisconsin, as well as 16 counties in New York. There are equivalent agencies in other states. Similar to a city council, a board of supervisors has legislative, executive, and quasi-judicial powers. The important difference is that a county is an administrative division of a state, whereas a city is a municipal corporation; thus, counties implement and, as necessary, refine the local application of state law and public policy, while cities produce and implement their own local laws and public policy (subject to the overriding authority of state law).',
            layerListOrder: 5
        },
        {
            legend: true,
            id: 'councilDistricts',
            layerName: 'CityDistricts',
            title: 'City Council Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'The council of a metropolitan district that has been granted city status. The council of a non-metropolitan district that has been granted city status. Some of these councils are unitary authorities and some share functions with county councils. A parish council that has been granted city status.',
            layerListOrder: 6
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
            showTOC: true,
            definition: 'Legislative districts are areas from which members are elected to state or equivalent entity legislatures. State legislative districts embody the upper (senate—SLDU) and lower (house—SLDL) chambers of the state legislatures.',
            layerListOrder: 7
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
            showTOC: true,
            definition: 'A congressional district is a territorial subdivision for electing members to a legislative body. Generally, only voters (constituents) who reside within the district are permitted to vote in an election held there.  There are 435 congressional districts in the United States House of Representatives, with each one representing approximately 711,000 people.',
            layerListOrder: 8
        },
        {
            legend: true,
            id: 'censusTracts',
            layerName: 'Tracts',
            title: 'Census Tracts',
            displayFields: ['COUNTY', 'NAME'],
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'Census Tracts are small, relatively permanent statistical subdivisions of a county or equivalent entity that are updated by local participants prior to each decennial census as part of the Census Bureau"s Participant Statistical Areas Program.The Census Bureau delineates census tracts in situations where no local participant existed or where state, local, or tribal governments declined to participate.The primary purpose of census tracts is to provide a stable set of geographic units for the presentation of statistical data.Census tracts generally have a population size between 1,200 and 8,000 people, with an optimum size of 4,000 people.A census tract usually covers a contiguous area; however, the spatial size of census tracts varies widely depending on the density of settlement.Census tract boundaries are delineated with the intention of being maintained over a long time so that statistical comparisons can be made from census to census.Census tracts occasionally are split due to population growth or merged as a result of substantial population decline.',
            layerListOrder: 9,
            labelClass: {
                labelExpressionInfo: {
                    expression: "Replace($feature.NAME, 'Census Tract ', '')"
                },
                symbol: {
                    type: 'text',
                    color: 'black',
                    haloSize: 1,
                    haloColor: 'white'
                },
                minScale: 288895
            }
        },
        {
            legend: true,
            id: 'opportunityZones',
            layerName: 'OpportunityZones',
            displayFields: ['COUNTY', 'NAME'],
            title: 'Opportunity Zones',
            type: 'feature',
            opacity: 0.8,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'Opportunity Zones are census tracts generally composed of economically distressed communities that qualify for the Opportunity Zone program, according to criteria outlined in 2017’s Tax Cuts and Jobs Act.',
            layerListOrder: 10,
            labelClass: {
                labelExpressionInfo: {
                    expression: "Replace($feature.NAME, 'Census Tract ', '')"
                },
                symbol: {
                    type: 'text',
                    color: 'black',
                    haloSize: 1,
                    haloColor: 'white'
                },
                minScale: 288895
            }
        },
        {
            legend: true,
            id: 'schoolDistElementary',
            layerName: 'SchoolDist_Elementary',
            title: 'Elementary School Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'A Elementary School District is a school distict that generally provides education to the lower grade/age levels - grades K-8.',
            layerListOrder: 11
        },
        {
            legend: true,
            id: 'schoolDistSecondary',
            layerName: 'SchoolDist_Secondary',
            title: 'Secondary School Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'A Secondary School District is a school distict that generally provides education to the upper grade/age levels - grades 9-12.',
            layerListOrder: 12
        },
        {
            legend: true,
            id: 'schoolDistUnified',
            layerName: 'SchoolDist_Unified',
            title: 'Unified School Districts',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'A Unified School District is a school district that generally includes and operates both Elementary and Secondary schools under the same district control. Unified school districts provide education to children of all school ages in their service areas - Grades K-12.',
            layerListOrder: 13
        },
        {
            legend: true,
            id: 'cogs',
            layerName: 'Cogs',
            title: 'Councils of Governments',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'Councils of governments (CoGs—also known as regional councils, regional commissions, regional planning commissions, and planning districts) are regional governing and/or coordinating bodies.',
            layerListOrder: 17
        }, {
            legend: true,
            id: 'mpos',
            layerName: 'Mpos',
            title: 'Metropolitan Planning Organizations',
            type: 'feature',
            opacity: 1,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'A metropolitan planning organization (MPO) is a federally mandated and federally funded transportation policy-making organization that is made up of representatives from local government and governmental transportation authorities. They were created to ensure regional cooperation in transportation planning.',
            layerListOrder: 18
        }, {
            legend: true,
            id: 'state',
            layerName: 'State',
            title: 'State Boundary',
            type: 'feature',
            opacity: 0.8,
            visible: false,
            showReport: true,
            showTOC: true,
            definition: 'State is a combination or association of persons in the form of government and governed and united together into a politically organized people of a definite territory.',
            layerListOrder: 18
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
    markupToolTreeNodes: [{
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

    // Specify the Markup Tool"s Fill and Outline Kendo Color Pallettes.
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

    sourceLabel: 'Source: United States Census Bureau, American Community Survey 2014-2018 5yr Estimates',

    sourceLabel2: 'Source: United States Census Bureau, 2010 Decennial Census',

    legalACSDisclaimer: 'Source: U.S. Census Bureau, 2014-2018 American Community Survey (ACS) 5-Year Estimates. ACS data are based on a sample and are subject to sampling variability.  The degree of uncertainty for an estimate is represented through the use of a margin of error (MOE).  In addition to sampling variability, the ACS estimates are subject to nonsampling error. The MOE and effect of nonsampling error is not represented in these tables. Supporting documentation on subject definitions, data accuracy, and statistical testing can be found on the American Community Survey website (www.census.gov/acs) in the Data and Documentation section. Sample size and data quality measures (including coverage rates, allocation rates, and response rates) can be found on the American Community Survey website (www.census.gov/acs) in the Methodology section.  The MOE for individual data elements can be found on the American FactFinder website (factfinder2.census.gov).  Note: Although the ACS produces population, demographic and housing unit estimates, the 2010 Census provides the official counts of the population and housing units for the nation, states, counties, cities and towns.  Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300',

    legalCensusDisclaimer: 'Source: United States Census Bureau, 2010 Decennial Census. Additional information about the 2010 Decennial Cenuss can be found on the US Census Bureau website at www.census.gov/2010census. Prepared by: Maricopa Association of Governments, www.azmag.gov, (602) 254-6300'
}; //End Config