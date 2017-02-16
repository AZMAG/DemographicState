(function() {

    "use strict";

    define(

        function() {
            var demographicConfig = new function() {
                var self = this;

                self.exportPDFCompareReportUrl = "http://geo.azmag.gov/services/Demographics2014/CompareReport.html";
                self.exportPDFReportUrl = "http://geo.azmag.gov/services/Demographics2014/reports.html";

                self.viewReportUrl = "http://localhost/MAG/MAGDemographicsReports/DemographicChartsReport.html";
                self.ACS2015byBlockGroup = appConfig.layerInfo[7].url;

                self.CompareOperators = {
                    string: [{
                        Name: "Equals",
                        Sign: "="
                    }, {
                        Name: "Starts With",
                        Sign: "%[value]"
                    }, {
                        Name: "Contains",
                        Sign: "%[value]%"
                    }, {
                        Name: "Ends With",
                        Sign: "[value]%"
                    }],
                    number: [{
                        Name: "Between",
                        Sign: "between"
                    }, {
                        Name: "Equals",
                        Sign: "="
                    }, {
                        Name: "Less Than",
                        Sign: "<"
                    }, {
                        Name: "Less Than Or Equal To",
                        Sign: "<="
                    }, {
                        Name: "Greater Than Or Equal To",
                        Sign: ">="
                    }, {
                        Name: "Greater Than",
                        Sign: ">"
                    }],
                    date: [{
                        Name: "Equals",
                        Sign: "="
                    }, {
                        Name: "Less Than",
                        Sign: "<"
                    }, {
                        Name: "Less Than Or Equal To",
                        Sign: "<="
                    }, {
                        Name: "Greater Than Or Equal To",
                        Sign: ">="
                    }, {
                        Name: "Greater Than",
                        Sign: ">"
                    }]
                };

                self.queryFields = [{
                    FieldName: "COUNTY",
                    Name: "County",
                    ShortName: "County",
                    Type: "string"
                }];

                // config for selected block groups tab
                self.selectedCensusBlockGroups = [
                    { field: "OBJECTID", hidden: true },
                    { field: "COUNTY", title: "County", width: "80px" },
                    { field: "TRACT_LABEL", title: "Tract", width: "75px", template: "<a class='link tractLink'>#=TRACT_LABEL#</a>" },
                    { field: "BLKGRPCE", title: "Block Group", width: "60px" },
                    { field: "SQMI", title: "Square Miles", width: "60px", format: "{0:n2}" },
                    { field: "ACRES", title: "Acres", width: "60px", format: "{0:n2}" },
                    { field: "TOTAL_POP", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "MINORITY_POP", title: "Minority Population", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_AGE", title: "Median Age", width: "55px", format: "{0:n2}" },
                    { field: "WHITE", title: "White Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "BLACK", title: "Black Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "NATIVE", title: "Native Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "ASIAN", title: "Asian Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "PACIFIC", title: "Pacific Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "TWO_OR_MORE", title: "Two or More Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "OTHER", title: "Other Non-Hispanic", width: "95px", format: "{0:n0}" },
                    { field: "HISPANIC", title: "Hispanic", width: "60px", format: "{0:n0}" },
                    { field: "NOT_HISPANIC", title: "Non Hispanic", width: "60px", format: "{0:n0}" },
                    { field: "UNDER5", title: "Under 5", width: "60px", format: "{0:n0}" },
                    { field: "AGE5TO17", title: "5 to 17", width: "60px", format: "{0:n0}" },
                    { field: "AGE18TO34", title: "18 to 34", width: "60px", format: "{0:n0}" },
                    { field: "AGE35TO49", title: "35 to 49", width: "60px", format: "{0:n0}" },
                    { field: "AGE50TO64", title: "50 to 64", width: "60px", format: "{0:n0}" },
                    { field: "AGE65TO84", title: "65 to 84", width: "60px", format: "{0:n0}" },
                    { field: "AGE85PLUS", title: "85 Plus", width: "60px", format: "{0:n0}" },
                    { field: "AGE50PLUS", title: "50 Plus", width: "60px", format: "{0:n0}" },
                    { field: "AGE60PLUS", title: "60 Plus", width: "60px", format: "{0:n0}" },
                    { field: "AGE65PLUS", title: "65 Plus", width: "60px", format: "{0:n0}" },
                    { field: "AGE70PLUS", title: "70 Plus", width: "60px", format: "{0:n0}" },
                    { field: "AGE75PLUS", title: "75 Plus", width: "60px", format: "{0:n0}" },
                    { field: "TOTAL_HU", title: "Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "OCCUPIED_HU", title: "Occupied Housing Units", width: "100px", format: "{0:n0}" },
                    { field: "VACANT_HU", title: "Vacant Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "SEASONAL_HU", title: "Seasonal Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "NON_SEASONAL_HU", title: "Non-Seasonal Housing Units", width: "100px", format: "{0:n0}" },
                    { field: "NON_SEASONAL_VACANT_HU", title: "Non-Seasonal Vacant Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "OWNER_OCC_HU", title: "Owner-Occupied Housing Units", width: "100px", format: "{0:n0}" },
                    { field: "RENTER_OCC_HU", title: "Renter-Occupied Housing Units", width: "100px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE", title: "Average Household Size", width: "80px", format: "{0:n2}" },
                    { field: "AVG_HH_SIZE_OWNER_HU", title: "Avg Household Size for Owner-Occupied Housing Units", width: "250px", format: "{0:n2}" },
                    { field: "AVG_HH_SIZE_RENTER_HU", title: "Avg Household Size for Renter-Occupied Housing Units", width: "250px", format: "{0:n2}" }
                ];

                // config for selected block groups tab
                self.selectedACSBlockGroups = [
                    { field: "OBJECTID", hidden: true },
                    { field: "COUNTY", title: "County", width: "80px" },
                    { field: "TRACT_LABEL", title: "Tract", width: "75px", template: "<a class='link tractLink'>#=TRACT_LABEL#</a>" },
                    { field: "BLKGRPCE", title: "Block Group", width: "60px" },
                    { field: "SQMI", title: "Square Miles", width: "60px", format: "{0:n2}" },
                    { field: "ACRES", title: "Acres", width: "80px", format: "{0:n2}" },
                    { field: "TOTAL_POP", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "MINORITY_POP", title: "Minority Population", width: "80px", format: "{0:n0}" }
                ];

                self.titleVIFields = ["DISABILITY"];

                self.reports = {
                    stateSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/10",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/3",
                        whereClause: "NAME = 'Arizona'",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/10",
                        compareACSUrl: self.ACS2015byBlockGroup + "/3",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        populateDropDown: false
                    },

                    countySummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/10",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/3",
                        whereClause: "NAME <> 'Arizona'",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/10",
                        compareACSUrl: self.ACS2015byBlockGroup + "/3",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        dropdown: "#countyComboBox"
                    },

                    cogSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/9",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/2",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/8",
                        compareACSUrl: self.ACS2015byBlockGroup + "/1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        dropdown: "#cogComboBox"
                    },

                    placeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/8",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/1",
                        whereClause: "1 = 1",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/8",
                        compareACSUrl: self.ACS2015byBlockGroup + "/1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        dropdown: "#placeComboBox"
                    },
                    legislativeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/11",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/4",
                        whereClause: "1 = 1",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/11",
                        compareACSUrl: self.ACS2015byBlockGroup + "/4",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "SLDIST_NAME",
                        summaryField: "SLDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        dropdown: "#legislativeComboBox"
                    },
                    congressionalSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/12",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/5",
                        whereClause: "1 = 1",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/12",
                        compareACSUrl: self.ACS2015byBlockGroup + "/5",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "CDIST_NAME",
                        summaryField: "CDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        dropdown: "#congressionalComboBox"
                    },
                    zipCodeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/13",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/6",
                        whereClause: "1 = 1",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/13",
                        compareACSUrl: self.ACS2015byBlockGroup + "/6",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "ZIPCODE",
                        summaryField: "ZIPCODE",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        dropdown: "#zipCodeComboBox"
                    },
                    censusTracts: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2015byBlockGroup + "/7",
                        ACSRestUrl: self.ACS2015byBlockGroup + "/0",
                        whereClause: "1 = 1",
                        compareCensusUrl: self.ACS2015byBlockGroup + "/7",
                        compareACSUrl: self.ACS2015byBlockGroup + "/1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "OBJECTID",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2011-2015 5yr",
                        populateDropDown: false
                    }
                };
            };
            return demographicConfig;
        }
    );
}());
