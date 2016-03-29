(function() {

    "use strict";

    define(

        function() {
            var demographicConfig = new function() {
                var self = this;


                self.exportPDFCompareReportUrl = "http://geo.azmag.gov/services/Demographics/CompareReport.html";
                self.exportPDFReportUrl = "http://geo.azmag.gov/services/Demographics/reports.html";
                self.viewReportUrl = "http://localhost/MAG/MAGDemographicsReports/DemographicChartsReport.html";
                self.ACS2014byBlockGroup = appConfig.layerInfo[5].url;
                // console.log(self.ACS2014byBlockGroup);

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
                self.selectedBlockGroups = [{
                    field: "OBJECTID",
                    hidden: true
                }, {
                    field: "COUNTY_NAME",
                    title: "County",
                    width: "80px"
                }, {
                    field: "TRACTCE10",
                    title: "Tract",
                    width: "55px"
                }, {
                    field: "BLKGRPCE10",
                    title: "Block Group",
                    width: "60px"
                }, {
                    field: "SQ_MI",
                    title: "Square Miles*",
                    width: "60px",
                    format: "{0:n2}"
                }, {
                    field: "TOT_POP",
                    title: "Total Population*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "MINORITY_POP",
                    title: "Minority Population*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "MEDIAN_AGE",
                    title: "Median Age*",
                    width: "55px",
                    format: "{0:n2}"
                }, {
                    field: "Under5",
                    title: "Under 5*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "Age5to17",
                    title: "Age 5 to 17*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age18to34",
                    title: "Age 18 to 34*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age35to49",
                    title: "Age 35 to 49*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age50to64",
                    title: "Age 50 to 64*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age65to84",
                    title: "Age 65 to 84*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age85Plus",
                    title: "Age 85 and Over*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age50Plus",
                    title: "Age 50 Plus*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age60Plus",
                    title: "Age 60 Plus*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age65Plus",
                    title: "Age 65 Plus*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age70Plus",
                    title: "Age 70 Plus*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "Age75Plus",
                    title: "Age 75 Plus*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "WHITE",
                    title: "White*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "BLACK",
                    title: "Black*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "NATIVE",
                    title: "Native*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "ASIAN",
                    title: "Asian*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "PACIFIC",
                    title: "Pacific*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "TWO_OR_MORE",
                    title: "Two or More*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "OTHER",
                    title: "Other*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "HISPANIC",
                    title: "Hispanic*",
                    width: "60px",
                    format: "{0:n0}"
                }, {
                    field: "NOT_HISPANIC",
                    title: "Not Hispanic*",
                    width: "60px",
                    format: "{0:n0}"
                }, {
                    field: "TOTAL_HOUSEHOLDS",
                    title: "Total Households^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "MEDIAN_HOUSEHOLD_INCOME",
                    title: "Median Household Income^",
                    width: "100px",
                    format: "{0:c}"
                }, {
                    field: "HOUSEHOLDS_LESS_THAN_25000",
                    title: "Households Less than $25,000^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "HOUSEHOLDS_25000_TO_49999",
                    title: "Households $25,000 to $49,999^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "HOUSEHOLDS_50000_TO_99999",
                    title: "Households $50,000 to $99,999^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "HOUSEHOLDS_100000_OR_MORE",
                    title: "Households $100,000 or More^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "TOTAL_FAMILY",
                    title: "Total Family^",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "INCOME_BELOW_POVERTY_LEVEL",
                    title: "Income Below  Poverty Level^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "POPULATION_25_YEARS_AND_OVER",
                    title: "Population 25yrs and Over^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "LT9GRADE",
                    title: "Less than 9th Grade^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "NOHSDIPLOMA",
                    title: "No HS Diploma^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "HSGRAD",
                    title: "High School Grad^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "SOMECOLLEGE",
                    title: "Some College^",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "ASSOCIATES",
                    title: "Associates^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "BACHELORS",
                    title: "Bachelors^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "GRADPROF",
                    title: "Graduates^",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "TOTAL_HU",
                    title: "Total Housing Units*",
                    width: "55px",
                    format: "{0:n0}"
                }, {
                    field: "OCCUPIED_HU",
                    title: "Occupied Housing Units*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "VACANT_HU",
                    title: "Vacant Housing Units*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "OWNER_OCC_HU",
                    title: "Owner Occupied Housing Units*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "RENTER_OCC_HU",
                    title: "Renter Occupited Housing Units*",
                    width: "80px",
                    format: "{0:n0}"
                }, {
                    field: "MEDIAN_VALUE",
                    title: "Median Value^",
                    width: "100px",
                    format: "{0:c}"
                }, {
                    field: "MEDIAN_GROSS_RENT",
                    title: "Median Gross Rent^",
                    width: "80px",
                    format: "{0:c}"
                }];

                self.reports = {

                    stateSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/8",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/2",
                        whereClause: "NAME = 'Arizona State'",
                        compareUrl: self.ACS2014byBlockGroup + "/2",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2014"
                    },

                    countySummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/8",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/2",
                        whereClause: "NAME <> 'Arizona State'",
                        compareUrl: self.ACS2014byBlockGroup + "/2",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2014"
                    },
                    placeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/7",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/1",
                        whereClause: "OBJECTID > -1",
                        compareUrl: self.ACS2014byBlockGroup + "/1",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2014"
                    },
                    legislativeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/9",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/3",
                        whereClause: "OBJECTID > -1",
                        compareUrl: self.ACS2014byBlockGroup + "/3",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "SLDIST_NAME",
                        summaryField: "SLDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2014"
                    },
                    congressionalSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/10",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/4",
                        whereClause: "OBJECTID > -1",
                        compareUrl: self.ACS2014byBlockGroup + "/4",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "CDIST_NAME",
                        summaryField: "CDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2014"
                    },
                    censusTracts: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/15",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/15",
                        whereClause: "OBJECTID > -1",
                        compareUrl: self.ACS2014byBlockGroup + "/15",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2014"
                    }
                };
            };
            return demographicConfig;
        }
    );
}());