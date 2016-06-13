(function() {

    "use strict";

    define(

        function() {
            var demographicConfig = new function() {
                var self = this;

                // self.exportPDFCompareReportUrl = "http://geo.azmag.gov/services/Demographics/CompareReport.html";
                // self.exportPDFReportUrl = "http://geo.azmag.gov/services/Demographics/reports.html";

                self.exportPDFCompareReportUrl = "http://geo.azmag.gov/services/test/Demographic2014/CompareReport.html";
                self.exportPDFReportUrl = "http://geo.azmag.gov/services/test/Demographic2014/Reports.html";


                self.viewReportUrl = "http://localhost/MAG/MAGDemographicsReports/DemographicChartsReport.html";
                self.ACS2014byBlockGroup = appConfig.layerInfo[6].url;

                self.CompareOperators = {
                    string: [
                    {
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
                    number: [
                    {
                        Name: "Between",
                        Sign: "between"
                    },
                    {
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

                self.queryFields =
                [
                        {
                          Name: "Area",
                          ShortName: "Area",
                          items: [
                            {
                                FieldName: "COUNTY_NAME",
                                Name: "County",
                                ShortName: "County",
                                Type: "string"
                            },{
                                FieldName: "TRACTCE10",
                                Name: "Tract",
                                ShortName: "Tract",
                                Type: "string"
                            }, {
                                FieldName: "BLKGRPCE10",
                                Name: "Block Group",
                                ShortName: "Block Group",
                                Type: "string"
                            },{
                                FieldName: "SQ_MI",
                                Name: "Square Miles",
                                ShortName: "Square Miles",
                                Type: "number"
                            }
                          ]
                        }
                ];

                // config for selected block groups tab
                self.selectedCensusBlockGroups=[
                {field:"OBJECTID",hidden:true},
                {field:"COUNTY",title:"County",width:"80px"},
                {field:"TRACT_LABEL",title:"Tract",width:"75px"},
                {field:"BLKGRPCE10",title:"Block Group",width:"60px"},
                {field:"SQMI",title:"Square Miles",width:"60px",format:"{0:n2}"},
                {field:"TOTAL_POP",title:"Total Population",width:"80px",format:"{0:n0}"},
                {field:"MINORITY_POP",title:"Minority Population",width:"80px",format:"{0:n0}"},
                {field:"MEDIAN_AGE",title:"Median Age",width:"55px",format:"{0:n2}"},
                {field:"WHITE",title:"White",width:"55px",format:"{0:n0}"},
                {field:"BLACK",title:"Black",width:"55px",format:"{0:n0}"},
                {field:"NATIVE",title:"Native",width:"55px",format:"{0:n0}"},
                {field:"ASIAN",title:"Asian",width:"55px",format:"{0:n0}"},
                {field:"PACIFIC",title:"Pacific",width:"55px",format:"{0:n0}"},
                {field:"TWO_OR_MORE",title:"Two or More",width:"55px",format:"{0:n0}"},
                {field:"OTHER",title:"Other",width:"55px",format:"{0:n0}"},
                {field:"HISPANIC",title:"Hispanic",width:"60px",format:"{0:n0}"},
                {field:"NOT_HISPANIC",title:"Not Hispanic",width:"60px",format:"{0:n0}"},
                {field:"AGE5TO17",title:"5 to 17",width:"60px",format:"{0:n0}"},
                {field:"AGE18TO34",title:"18 to 34",width:"60px",format:"{0:n0}"},
                {field:"AGE35TO49",title:"35 to 49",width:"60px",format:"{0:n0}"},
                {field:"AGE50TO64",title:"50 to 64",width:"60px",format:"{0:n0}"},
                {field:"AGE65TO84",title:"65 to 84",width:"60px",format:"{0:n0}"},
                {field:"AGE85PLUS",title:"85 Plus",width:"60px",format:"{0:n0}"}
                ];

                // config for selected block groups tab
                self.selectedACSBlockGroups=[
                {field:"OBJECTID",hidden:true},
                {field:"COUNTY",title:"County",width:"80px"},
                {field:"TRACT_LABEL",title:"Tract",width:"75px"},
                {field:"BLKGRPCE14",title:"Block Group",width:"60px"},
                {field:"SQMI",title:"Square Miles",width:"60px",format:"{0:n2}"},
                {field:"TOTAL_POP",title:"Total Population",width:"80px",format:"{0:n0}"},
                {field:"MINORITY_POP",title:"Minority Population",width:"80px",format:"{0:n0}"},
                {field:"MEDIAN_AGE",title:"Median Age",width:"55px",format:"{0:n2}"},
                {field:"WHITE",title:"White",width:"55px",format:"{0:n0}"},
                {field:"BLACK",title:"Black",width:"55px",format:"{0:n0}"},
                {field:"NATIVE",title:"Native",width:"55px",format:"{0:n0}"},
                {field:"ASIAN",title:"Asian",width:"55px",format:"{0:n0}"},
                {field:"PACIFIC",title:"Pacific",width:"55px",format:"{0:n0}"},
                {field:"TWO_OR_MORE",title:"Two or More",width:"55px",format:"{0:n0}"},
                {field:"OTHER",title:"Other",width:"55px",format:"{0:n0}"},
                {field:"HISPANIC",title:"Hispanic",width:"60px",format:"{0:n0}"},
                {field:"NOT_HISPANIC",title:"Not Hispanic",width:"60px",format:"{0:n0}"},
                {field:"TOTAL_HOUSEHOLDS",title:"Total Households",width:"80px",format:"{0:n0}"},
                {field:"MEDIAN_HOUSEHOLD_INCOME",title:"Median Household Income",width:"100px",format:"{0:c}"},
                {field:"HH_LESS_THAN_25K",title:"Households Less than $25,000",width:"80px",format:"{0:n0}"},
                {field:"HH_25K_TO_49K",title:"Households $25,000 to $49,999",width:"80px",format:"{0:n0}"},
                {field:"HH_50K_TO_99K",title:"Households $50,000 to $99,999",width:"80px",format:"{0:n0}"},
                {field:"HH_100K_PLUS",title:"Households $100,000 or More",width:"80px",format:"{0:n0}"}];

                self.agePyramidFields=["TOTAL_MALE","M_Y5LESS5","M_Y5TO9","M_Y10TO14","M_Y15TO17","M_Y18TO19","M_Y20","M_Y21","M_Y22TO24","M_Y25TO29","M_Y30TO34","M_Y35TO39","M_Y40TO44","M_Y45TO49","M_Y50TO54","M_Y55TO59","M_Y60TO61","M_Y62TO64","M_Y65TO66","M_Y67TO69","M_Y70TO74","M_Y75TO79","M_Y80TO84","M_Y85UP","TOTAL_FEMALE","F_Y5LESS5","F_Y5TO9","F_Y10TO14","F_Y15TO17","F_Y18TO19","F_Y20","F_Y21","F_Y22TO24","F_Y25TO29","F_Y30TO34","F_Y35TO39","F_Y40TO44","F_Y45TO49","F_Y50TO54","F_Y55TO59","F_Y60TO61","F_Y62TO64","F_Y65TO66","F_Y67TO69","F_Y70TO74","F_Y75TO79","F_Y80TO84","F_Y85UP"];

                self.reports = {

                    stateSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/8",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/2",
                        whereClause: "NAME = 'Arizona State'",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/8",
                        compareACSUrl: self.ACS2014byBlockGroup + "/2",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        populateDropDown: false
                    },

                    countySummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/8",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/2",
                        whereClause: "NAME <> 'Arizona State'",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/8",
                        compareACSUrl: self.ACS2014byBlockGroup + "/2",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#countyComboBox"
                    },
                    placeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/7",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/1",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/7",
                        compareACSUrl: self.ACS2014byBlockGroup + "/1",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#placeComboBox"
                    },
                    legislativeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/9",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/3",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/9",
                        compareACSUrl: self.ACS2014byBlockGroup + "/3",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "SLDIST_NAME",
                        summaryField: "SLDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#legislativeComboBox"
                    },
                    congressionalSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/10",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/4",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/10",
                        compareACSUrl: self.ACS2014byBlockGroup + "/4",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "CDIST_NAME",
                        summaryField: "CDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#congressionalComboBox"
                    },
                    zipCodeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/11",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/5",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/11",
                        compareACSUrl: self.ACS2014byBlockGroup + "/5",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "ZIPCODE",
                        summaryField: "ZIPCODE",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#zipCodeComboBox"
                    },
                    censusTracts: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/6",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/0",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/7",
                        compareACSUrl: self.ACS2014byBlockGroup + "/1",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "OBJECTID",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        populateDropDown: false
                    }
                };
            };
            return demographicConfig;
        }
    );
}());