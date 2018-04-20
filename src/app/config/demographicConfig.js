(function() {

    "use strict";

    define(

        function() {
            var demographicConfig = new function() {
                var self = this;

                self.exportPDFCompareReportUrl = "https://geo.azmag.gov/services/demographics2016/CompareReport.html";
                self.exportPDFReportUrl = "https://geo.azmag.gov/services/demographics2016/Reports.html";
                self.viewReportUrl = "https://localhost/MAG/MAGDemographicsReports/DemographicChartsReport.html";

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
                    Name: "Area",
                    ShortName: "Area",
                    items: [{
                        FieldName: "COUNTY",
                        Name: "County",
                        ShortName: "County",
                        Type: "string"
                    }, {
                        FieldName: "ZIPCODE",
                        Name: "Zip Code",
                        ShortName: "Zip Code",
                        Type: "string"
                    },{
                        FieldName: "TRACTCE",
                        Name: "Tract",
                        ShortName: "Tract",
                        Type: "string"
                    }, {
                        FieldName: "BLKGRPCE",
                        Name: "Block Group",
                        ShortName: "Block Group",
                        Type: "string"
                    }, {
                        FieldName: "SQMI",
                        Name: "Square Miles",
                        ShortName: "Square Miles",
                        Type: "number"
                    }]
                }];

                // config for selected block groups tab
                self.selectedCensusBlockGroups = [
                    { field: "OBJECTID", hidden: true },
                    { field: "COUNTY", title: "County", width: "80px" },
                    { field: "TRACT_LABEL", title: "Tract", width: "75px", template: "<a class='link tractLink'>#=TRACT_LABEL#</a>" },
                    { field: "BLKGRPCE", title: "Block Group", width: "60px" },
                    { field: "SQMI", title: "Square Miles", width: "60px", format: "{0:n1}" },
                    { field: "ACRES", title: "Acres", width: "60px", format: "{0:n1}" },
                    { field: "TOTAL_POP", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "MINORITY_POP", title: "Minority Population", width: "80px", format: "{0:n0}" },
                    // { field: "MEDIAN_AGE", title: "Median Age", width: "55px", format: "{0:n1}" },
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
                    { field: "AVG_HH_SIZE", title: "Average Household Size", width: "80px", format: "{0:n1}" },
                    { field: "AVG_HH_SIZE_OWNER_HU", title: "Avg Household Size for Owner-Occupied Housing Units", width: "250px", format: "{0:n1}" },
                    { field: "AVG_HH_SIZE_RENTER_HU", title: "Avg Household Size for Renter-Occupied Housing Units", width: "250px", format: "{0:n1}" }
                ];

                // config for selected block groups tab
                self.selectedACSBlockGroups = [
                    { field: "OBJECTID", hidden: true },
                    { field: "COUNTY", title: "County", width: "80px" },
                    { field: "TRACT_LABEL", title: "Tract", width: "75px", template: "<a class='link tractLink'>#=TRACT_LABEL#</a>" },
                    { field: "BLKGRPCE", title: "Block Group", width: "60px" },
                    { field: "SQMI", title: "Square Miles", width: "60px", format: "{0:n1}" },
                    { field: "ACRES", title: "Acres", width: "80px", format: "{0:n1}" },
                    { field: "TOTAL_POP", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "MALE", title: "Male", width: "80px", format: "{0:n0}" },
                    { field: "FEMALE", title: "Female", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_AGE", title: "Median Age", width: "80px", format: "{0:n0}" },
                    { field: "UNDER5", title: "Under 5 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE5TO9", title: "5 to 9 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE10TO14", title: "10 to 14 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE15TO19", title: "15 to 19 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE20TO24", title: "20 to 24 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE25TO34", title: "25 to 34 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE35TO44", title: "35 to 44 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE45TO54", title: "45 to 54 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE55TO59", title: "55 to 59 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE60TO64", title: "60 to 64 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE65TO74", title: "65 to 74 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE75TO84", title: "75 to 84 years", width: "80px", format: "{0:n0}" },
                    { field: "AGE85PLUS", title: "85 years and over", width: "80px", format: "{0:n0}" },
                    { field: "AGE18PLUS", title: "18 years and over", width: "80px", format: "{0:n0}" },
                    { field: "AGE21PLUS", title: "21 years and over", width: "80px", format: "{0:n0}" },
                    { field: "AGE62PLUS", title: "62 years and over", width: "80px", format: "{0:n0}" },
                    { field: "AGE65PLUS", title: "65 years and over", width: "80px", format: "{0:n0}" },
                    { field: "TOTAL_POP2", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "HISPANIC", title: "Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "WHITE_NON_HISPANIC", title: "White, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "BLACK_NON_HISPANIC", title: "Black, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "NATIVE_NON_HISPANIC", title: "Native American, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "ASIAN_NON_HISPANIC", title: "Asian, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "PACIFIC_NON_HISPANIC", title: "Pacific Islander, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "OTHER_NON_HISPANIC", title: "Other, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "TWO_OR_MORE_NON_HISPANIC", title: "Two or More, Non-Hispanic", width: "80px", format: "{0:n0}" },
                    { field: "MINORITY_POP", title: "Minority (1)", width: "80px", format: "{0:n0}" },
                    { field: "AGE25PLUS", title: "Population 25 years and over", width: "80px", format: "{0:n0}" },
                    { field: "LT9GRADE", title: "Less than 9th Grade", width: "80px", format: "{0:n0}" },
                    { field: "NOHSDIPLOMA", title: "9th to 12th Grade, No Diploma", width: "80px", format: "{0:n0}" },
                    { field: "HSGRAD", title: "High School Graduate (includes equivalency)", width: "80px", format: "{0:n0}" },
                    { field: "SOMECOLLEGE", title: "Some College, No Degree", width: "80px", format: "{0:n0}" },
                    { field: "ASSOCIATES", title: "Associate Degree", width: "80px", format: "{0:n0}" },
                    { field: "BACHELORS", title: "Bachelor's Degree", width: "80px", format: "{0:n0}" },
                    { field: "GRADPROF", title: "Graduate or Professional Degree", width: "80px", format: "{0:n0}" },
                    { field: "AGE5PLUS", title: "Population 5 years and over", width: "80px", format: "{0:n0}" },
                    { field: "SPEAK_ONLY_ENG", title: "Speak Only English", width: "80px", format: "{0:n0}" },
                    { field: "SPEAK_OTHER_LANGS", title: "Speak Other Languages", width: "80px", format: "{0:n0}" },
                    { field: "SPEAK_ENG_VERYWELL", title: "Speak English ''very well''", width: "80px", format: "{0:n0}" },
                    { field: "LIMITED_ENG_PROF", title: "Persons with Limited English Proficiency (LEP)", width: "80px", format: "{0:n0}" },
                    { field: "SPEAK_ENG_WELL", title: "Speak English ''well''", width: "80px", format: "{0:n0}" },
                    { field: "SPEAK_ENG_NOTWELL", title: "Speak English ''not well''", width: "80px", format: "{0:n0}" },
                    { field: "SPEAK_ENG_NOTATALL", title: "Speak English ''not at all''", width: "80px", format: "{0:n0}" },
                    { field: "CIV_POP_18PLUS", title: "Civilian Population 18 years and over", width: "80px", format: "{0:n0}" },
                    { field: "VETERANS", title: "Civilian veterans", width: "80px", format: "{0:n0}" },
                    { field: "MALE_VETERANS", title: "Male", width: "80px", format: "{0:n0}" },
                    { field: "FEMALE_VETERANS", title: "Female", width: "80px", format: "{0:n0}" },
                    { field: "VETS_18TO34", title: "18 to 34 years", width: "80px", format: "{0:n0}" },
                    { field: "VETS_35TO54", title: "35 to 54 years", width: "80px", format: "{0:n0}" },
                    { field: "VETS_55TO64", title: "55 to 64 years", width: "80px", format: "{0:n0}" },
                    { field: "VETS_65TO74", title: "65 to 74 years ", width: "80px", format: "{0:n0}" },
                    { field: "VETS_75PLUS", title: "75 years and over", width: "80px", format: "{0:n0}" },
                    { field: "TOTAL_HOUSEHOLDS", title: "Total Households", width: "80px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE", title: "Average Household Size", width: "80px", format: "{0:n0}" },
                    { field: "FAMILY_HOUSEHOLDS", title: "Family Households (Families)", width: "80px", format: "{0:n0}" },
                    { field: "MARRIED_COUPLE_FAMILY", title: "Married-couple family", width: "80px", format: "{0:n0}" },
                    { field: "FEMALE_HOUSEHOLDER_NOHUSB", title: "Female Householder, no husband present", width: "80px", format: "{0:n0}" },
                    { field: "FEMALE_HH_CHILD_UNDER18", title: "with own children under 18 years", width: "80px", format: "{0:n0}" },
                    { field: "NON_FAMILY_HOUSEHOLDS", title: "Nonfamily Households", width: "80px", format: "{0:n0}" },
                    { field: "NONFAM_HH_LIVE_ALONE", title: "Householder living alone", width: "80px", format: "{0:n0}" },
                    { field: "TOTAL_HH_FOR_INCOME", title: "Total Households", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_HOUSEHOLD_INCOME", title: "Median Household Income (dollars)", width: "80px", format: "{0:n0}" },
                    { field: "HH_LESS_THAN_10K", title: "Less than $10,000", width: "80px", format: "{0:n0}" },
                    { field: "HH_10K_TO_14K", title: "$10,000 to $14,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_15K_TO_24K", title: "$15,000 to $24,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_25K_TO_34K", title: "$25,000 to $34,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_35K_TO_49K", title: "$35,000 to 49,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_50K_TO_74K", title: "$50,000 to $74,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_75K_TO_99K", title: "$75,000 to $99,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_100K_TO_149K", title: "$100,000 to $149,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_150K_TO_199K", title: "$150,000 to $199,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_200K_PLUS", title: "$200,000 or more", width: "80px", format: "{0:n0}" },
                    { field: "POP_FOR_POVERTY", title: "Persons for whom poverty status is determined", width: "80px", format: "{0:n0}" },
                    { field: "INCOME_BELOW_POVERTY", title: "Persons with income below poverty level", width: "80px", format: "{0:n0}" },
                    { field: "INCOME_BELOW_150PCT_POVERTY", title: "Persons with income below 150% of poverty level", width: "80px", format: "{0:n0}" },
                    { field: "INCOME_BELOW_200PCT_POVERTY", title: "Persons with income below 200% of poverty level", width: "80px", format: "{0:n0}" },
                    { field: "TOTAL_FAMILIES", title: "Total Families", width: "80px", format: "{0:n0}" },
                    { field: "FAM_INCOME_BELOW_POVERTY", title: "Families with income below poverty level", width: "80px", format: "{0:n0}" },
                    { field: "MARRIEDCOUPLE_BELOWPOV", title: "Married-couple family", width: "80px", format: "{0:n0}" },
                    { field: "COUPLE_BLWPOV_CHILDUNDER18", title: "with related children under 18 years ", width: "80px", format: "{0:n0}" },
                    { field: "FEMALE_BLWPOV_NOHUSB", title: "Female householder, no husband present", width: "80px", format: "{0:n0}" },
                    { field: "FEMALE_BLWPOV_CHILDUNDER18", title: "with related children under 18 years", width: "80px", format: "{0:n0}" },
                    { field: "MALE_BLWPOV_NOWIFE", title: "Male householder, no wife present", width: "80px", format: "{0:n0}" },
                    { field: "MALE_BLWPOV_CHILDUNDER18", title: "with related children under 18 years   ", width: "80px", format: "{0:n0}" },
                    { field: "TOT_WORKERS_16PLUS", title: "Workers 16 years and over", width: "80px", format: "{0:n0}" },
                    { field: "DROVE_ALONE", title: "Car, truck, or van - drove alone", width: "80px", format: "{0:n0}" },
                    { field: "CARPOOLED", title: "Car, truck, or van - carpooled", width: "80px", format: "{0:n0}" },
                    { field: "PUBLIC_TRANSPORTATION", title: "Public Transportation (excluding taxicab)", width: "80px", format: "{0:n0}" },
                    { field: "BICYCLE", title: "Bicycle", width: "80px", format: "{0:n0}" },
                    { field: "WALKED", title: "Walked", width: "80px", format: "{0:n0}" },
                    { field: "TAXI_MOTORCYCLE_OR_OTHER", title: "Taxicab, motorcycle, or other means", width: "80px", format: "{0:n0}" },
                    { field: "WORKED_FROM_HOME", title: "Work at home", width: "80px", format: "{0:n0}" },
                    { field: "TOTAL_HOUSING_UNITS", title: "Total Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "ONE_UNIT_DETACHED", title: "1, detached", width: "80px", format: "{0:n0}" },
                    { field: "ONE_UNIT_ATTACHED", title: "1, attached", width: "80px", format: "{0:n0}" },
                    { field: "TWO_TO_NINE_UNITS", title: "2 to 9", width: "80px", format: "{0:n0}" },
                    { field: "TEN_OR_MORE_UNITS", title: "10 or more", width: "80px", format: "{0:n0}" },
                    { field: "MOBILE_HOME", title: "Mobile Home", width: "80px", format: "{0:n0}" },
                    { field: "BOAT_RV_VAN_ETC", title: "Boat, RV, van, etc.", width: "80px", format: "{0:n0}" },
                    { field: "OCCUPIED_HU", title: "Occupied Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "AVG_HOUSEHOLD_SIZE", title: "Average Household Size", width: "80px", format: "{0:n0}" },
                    { field: "OWNER_OCC_HU", title: "Owner Occupied Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE_OWNER_HU", title: "Average Household size of Owner Occupied Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_VALUE", title: "Median Value (dollars)", width: "80px", format: "{0:n0}" },
                    { field: "RENTER_OCC_HU", title: "Renter Occupied Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE_RENTER_HU", title: "Average Household size of Renter Occupied Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_GROSS_RENT", title: "Median Rent (dollars)", width: "80px", format: "{0:n0}" },
                    { field: "VACANT_HU", title: "Vacant Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "SEASONAL_VACANT", title: "For seasonal, recreational, or occasional use", width: "80px", format: "{0:n0}" },
                    { field: "ALL_OTHER_VACANT", title: "All other vacant", width: "80px", format: "{0:n0}" },
                    { field: "TOTAL_OCCUPIED_HU", title: "Occupied Housing Units", width: "80px", format: "{0:n0}" },
                    { field: "NO_VEHICLE", title: "No vehicle available", width: "80px", format: "{0:n0}" },
                    { field: "ONE_VEHICLE", title: "1 vehicle available", width: "80px", format: "{0:n0}" },
                    { field: "TWO_VEHICLES", title: "2 vehicles available", width: "80px", format: "{0:n0}" },
                    { field: "THREE_PLUS_VEHICLES", title: "3 or more vehicles available", width: "80px", format: "{0:n0}" }
                ];

                self.titleVIFields = ["DISABILITY"];

                self.reports = {
                    stateSummary: {
                        exportPDFParameter: "state",
                        name: "Demographic Summary",
                        helpItem: "State",
                        layerName: "State",
                        whereClause: "NAME = 'Arizona'",
                        compareCensusUrl: appConfig.mainURL + "/13",
                        compareACSUrl: appConfig.mainURL + "/3",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        populateDropDown: false
                    },
                    countySummary: {
                        exportPDFParameter: "county",
                        name: "Demographic Summary",
                        layerName: "Counties",
                        helpItem: "County",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        sortField: "NAME",
                        dropdown: "#countyComboBox"
                    },
                    cogSummary: {
                        exportPDFParameter: "cog",
                        name: "Demographic Summary",
                        helpItem: "Cog or Mpo",
                        layerName: "Cogs_Mpos",
                        compareCensusUrl: appConfig.mainURL + "/13",
                        compareACSUrl: appConfig.mainURL + "/3",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        sortField: "NAME",
                        dropdown: "#cogComboBox"
                    },
                    placeSummary: {
                        exportPDFParameter: "city",
                        name: "Demographic Summary",
                        helpItem: "Place",
                        layerName: "Places",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "Name",
                        summaryField: "Name",
                        sortField: "Name",
                        dropdown: "#placeComboBox"
                    },
                    legislativeSummary: {
                        exportPDFParameter: "legislative",
                        name: "Demographic Summary",
                        helpItem: "Legislative District",
                        layerName: "Legislative_Districts",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "SLDIST_NAME",
                        summaryField: "SLDIST_NAME",
                        sortField: "SLDISTID",
                        dropdown: "#legislativeComboBox"
                    },
                    congressionalSummary: {
                        exportPDFParameter: "congressional",
                        name: "Demographic Summary",
                        helpItem: "Congressional District",
                        layerName: "Congressional_Districts",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "CDIST_NAME",
                        summaryField: "CDIST_NAME",
                        sortField: "CDIST_NAME",
                        dropdown: "#congressionalComboBox"
                    },
                    supervisorSummary: {
                        exportPDFParameter: "supervisor",
                        name: "Demographic Summary",
                        helpItem: "Supervisor District",
                        layerName: "SupervisorDistricts",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "SuperDistName",
                        summaryField: "SuperDistName",
                        sortField: "SuperDistName",
                        dropdown: "#supervisorComboBox"
                    },
                    councilDistrictSummary: {
                        exportPDFParameter: "council",
                        name: "Demographic Summary",
                        helpItem: "Council District",
                        layerName: "CityDistricts",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "CityDistrictName",
                        summaryField: "CityDistrictName",
                        sortField: "CityDistrictName",
                        dropdown: "#councilDistrictComboBox"
                    },
                    zipCodeSummary: {
                        exportPDFParameter: "zipCode",
                        name: "Demographic Summary",
                        helpItem: "Zip Code",
                        layerName: "Zip_Codes",
                        whereClause: "1 = 1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "ZIPCODE",
                        summaryField: "ZIPCODE",
                        sortField: "ZIPCODE",
                        dropdown: "#zipCodeComboBox"
                    },
                    blockGroups: {
                        exportPDFParameter: "interactive",
                        name: "Demographic Summary",
                        helpItem: "Block Group(s)",
                        layerName: "Block_Groups",
                        whereClause: "1 = 1",
                        compareCensusUrl: appConfig.mainURL + "/11",
                        compareACSUrl: appConfig.mainURL + "/1",
                        compareWhereClause: "1 = 1",
                        comparePlaceField: "Name",
                        summaryField: "OBJECTID",
                        sortField: "OBJECTID",
                        populateDropDown: false
                    }
                };
            };
            return demographicConfig;
        }
    );
}());
