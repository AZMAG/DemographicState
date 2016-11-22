(function() {

    "use strict";

    define(

        function() {
            var demographicConfig = new function() {
                var self = this;

                self.exportPDFCompareReportUrl = "http://geo.azmag.gov/services/Demographics2014/CompareReport.html";
                self.exportPDFReportUrl = "http://geo.azmag.gov/services/Demographics2014/reports.html";

                self.viewReportUrl = "http://localhost/MAG/MAGDemographicsReports/DemographicChartsReport.html";
                self.ACS2014byBlockGroup = appConfig.layerInfo[7].url;

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
                        FieldName: "TRACTCE14",
                        Name: "Tract",
                        ShortName: "Tract",
                        Type: "string"
                    }, {
                        FieldName: "BLKGRPCE14",
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
                    { field: "BLKGRPCE10", title: "Block Group", width: "60px" },
                    { field: "SQMI", title: "Square Miles", width: "60px", format: "{0:n2}" },
                    { field: "ACRES", title: "Acres", width: "60px", format: "{0:n2}" },
                    { field: "TOTAL_POP", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "MINORITY_POP", title: "Minority Population", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_AGE", title: "Median Age", width: "55px", format: "{0:n2}" },
                    { field: "WHITE", title: "White", width: "55px", format: "{0:n0}" },
                    { field: "BLACK", title: "Black", width: "55px", format: "{0:n0}" },
                    { field: "NATIVE", title: "Native", width: "55px", format: "{0:n0}" },
                    { field: "ASIAN", title: "Asian", width: "55px", format: "{0:n0}" },
                    { field: "PACIFIC", title: "Pacific", width: "55px", format: "{0:n0}" },
                    { field: "TWO_OR_MORE", title: "Two or More", width: "55px", format: "{0:n0}" },
                    { field: "OTHER", title: "Other", width: "55px", format: "{0:n0}" },
                    { field: "HISPANIC", title: "Hispanic", width: "60px", format: "{0:n0}" },
                    { field: "NOT_HISPANIC", title: "Not Hispanic", width: "60px", format: "{0:n0}" },
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
                    { field: "BLKGRPCE14", title: "Block Group", width: "60px" },
                    { field: "SQMI", title: "Square Miles", width: "60px", format: "{0:n2}" },
                    { field: "ACRES", title: "Acres", width: "80px", format: "{0:n2}" },
                    { field: "TOTAL_POP", title: "Total Population", width: "80px", format: "{0:n0}" },
                    { field: "MINORITY_POP", title: "Minority Population", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_AGE", title: "Median Age", width: "55px", format: "{0:n2}" },
                    { field: "WHITE", title: "White", width: "55px", format: "{0:n0}" },
                    { field: "BLACK", title: "Black", width: "55px", format: "{0:n0}" },
                    { field: "NATIVE", title: "Native", width: "55px", format: "{0:n0}" },
                    { field: "ASIAN", title: "Asian", width: "55px", format: "{0:n0}" },
                    { field: "PACIFIC", title: "Pacific", width: "55px", format: "{0:n0}" },
                    { field: "TWO_OR_MORE", title: "Two or More", width: "55px", format: "{0:n0}" },
                    { field: "OTHER", title: "Other", width: "55px", format: "{0:n0}" },
                    { field: "HISPANIC", title: "Hispanic", width: "60px", format: "{0:n0}" },
                    { field: "NOT_HISPANIC", title: "Not Hispanic", width: "60px", format: "{0:n0}" },
                    { field: "TOTAL_HOUSEHOLDS", title: "Total Households", width: "80px", format: "{0:n0}" },
                    { field: "MEDIAN_HOUSEHOLD_INCOME", title: "Median Household Income", width: "100px", format: "{0:c}" },
                    { field: "HH_LESS_THAN_25K", title: "Households Less than $25,000", width: "80px", format: "{0:n0}" },
                    { field: "HH_25K_TO_49K", title: "Households $25,000 to $49,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_50K_TO_99K", title: "Households $50,000 to $99,999", width: "80px", format: "{0:n0}" },
                    { field: "HH_100K_PLUS", title: "Households $100,000 or More", width: "80px", format: "{0:n0}" },
                    { field: "UNDER5", title: "Under 5", width: "80px", format: "{0:n0}" },
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
                    { field: "TOTAL_MALE", title: "TOTAL_MALE", width: "90px", format: "{0:n0}" },
                    { field: "M_Y5LESS5", title: "Males less than 5", width: "90px", format: "{0:n0}" },
                    { field: "M_Y5TO9", title: "Males age 5 to 9", width: "90px", format: "{0:n0}" },
                    { field: "M_Y10TO14", title: "Males age 10 to 14", width: "90px", format: "{0:n0}" },
                    { field: "M_Y15TO17", title: "Males age 15 to 17", width: "90px", format: "{0:n0}" },
                    { field: "M_Y18TO19", title: "Males age 18 to 19", width: "90px", format: "{0:n0}" },
                    { field: "M_Y20", title: "Males age 20", width: "90px", format: "{0:n0}" },
                    { field: "M_Y21", title: "Males age 21", width: "90px", format: "{0:n0}" },
                    { field: "M_Y22TO24", title: "Males age 22 to 24", width: "90px", format: "{0:n0}" },
                    { field: "M_Y25TO29", title: "Males age 25 to 29", width: "90px", format: "{0:n0}" },
                    { field: "M_Y30TO34", title: "Males age 30 to 34", width: "90px", format: "{0:n0}" },
                    { field: "M_Y35TO39", title: "Males age 35 to 39", width: "90px", format: "{0:n0}" },
                    { field: "M_Y40TO44", title: "Males age 40 to 44", width: "90px", format: "{0:n0}" },
                    { field: "M_Y45TO49", title: "Males age 45 to 49", width: "90px", format: "{0:n0}" },
                    { field: "M_Y50TO54", title: "Males age 50 to 54", width: "90px", format: "{0:n0}" },
                    { field: "M_Y55TO59", title: "Males age 55 to 59", width: "90px", format: "{0:n0}" },
                    { field: "M_Y60TO61", title: "Males age 60 to 61", width: "90px", format: "{0:n0}" },
                    { field: "M_Y62TO64", title: "Males age 62 to 64", width: "90px", format: "{0:n0}" },
                    { field: "M_Y65TO66", title: "Males age 65 to 66", width: "90px", format: "{0:n0}" },
                    { field: "M_Y67TO69", title: "Males age 67 to 69", width: "90px", format: "{0:n0}" },
                    { field: "M_Y70TO74", title: "Males age 70 to 74", width: "90px", format: "{0:n0}" },
                    { field: "M_Y75TO79", title: "Males age 75 to 79", width: "90px", format: "{0:n0}" },
                    { field: "M_Y80TO84", title: "Males age 80 to 84", width: "90px", format: "{0:n0}" },
                    { field: "M_Y85UP", title: "Males age 85 or older", width: "90px", format: "{0:n0}" },
                    { field: "TOTAL_FEMALE", title: "Female Population", width: "90px", format: "{0:n0}" },
                    { field: "F_Y5LESS5", title: "Females less than 5", width: "90px", format: "{0:n0}" },
                    { field: "F_Y5TO9", title: "Females age 5 to 9", width: "90px", format: "{0:n0}" },
                    { field: "F_Y10TO14", title: "Females age 10 to 14", width: "90px", format: "{0:n0}" },
                    { field: "F_Y15TO17", title: "Females age 15 to 17", width: "90px", format: "{0:n0}" },
                    { field: "F_Y18TO19", title: "Females age 18 to 19", width: "90px", format: "{0:n0}" },
                    { field: "F_Y20", title: "Females age 20", width: "90px", format: "{0:n0}" },
                    { field: "F_Y21", title: "Females age 21", width: "90px", format: "{0:n0}" },
                    { field: "F_Y22TO24", title: "Females age 22 to 24", width: "90px", format: "{0:n0}" },
                    { field: "F_Y25TO29", title: "Females age 25 to 29", width: "90px", format: "{0:n0}" },
                    { field: "F_Y30TO34", title: "Females age 30 to 34", width: "90px", format: "{0:n0}" },
                    { field: "F_Y35TO39", title: "Females age 35 to 39", width: "90px", format: "{0:n0}" },
                    { field: "F_Y40TO44", title: "Females age 40 to 44", width: "90px", format: "{0:n0}" },
                    { field: "F_Y45TO49", title: "Females age 45 to 49", width: "90px", format: "{0:n0}" },
                    { field: "F_Y50TO54", title: "Females age 50 to 54", width: "90px", format: "{0:n0}" },
                    { field: "F_Y55TO59", title: "Females age 55 to 59", width: "90px", format: "{0:n0}" },
                    { field: "F_Y60TO61", title: "Females age 60 to 61", width: "90px", format: "{0:n0}" },
                    { field: "F_Y62TO64", title: "Females age 62 to 64", width: "90px", format: "{0:n0}" },
                    { field: "F_Y65TO66", title: "Females age 65 to 66", width: "90px", format: "{0:n0}" },
                    { field: "F_Y67TO69", title: "Females age 67 to 69", width: "90px", format: "{0:n0}" },
                    { field: "F_Y70TO74", title: "Females age 70 to 74", width: "90px", format: "{0:n0}" },
                    { field: "F_Y75TO79", title: "Females age 75 to 79", width: "90px", format: "{0:n0}" },
                    { field: "F_Y80TO84", title: "Females age 80 to 84", width: "90px", format: "{0:n0}" },
                    { field: "F_Y85UP", title: "Females age 85 or older", width: "90px", format: "{0:n0}" },
                    { field: "TOTAL_FAMILIES", title: "Total Families", width: "90px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE", title: "Average Household Size", width: "90px", format: "{0:n0}" },
                    { field: "LINGLSO_HH", title: "Linguistically Isolated Households", width: "150px", format: "{0:n0}" },
                    { field: "PER_CAPITA_INCOME", title: "Per Capita Income", width: "150px", format: "{0:c0}" },
                    { field: "INCOME_BELOW_POVERTY_LEVEL", title: "Income Below Poverty Level", width: "150px", format: "{0:n0}" },
                    { field: "INCOME_NOT_BELOW_POVERTY_LEVEL", title: "Income Not Below Poverty Level", width: "150px", format: "{0:n0}" },
                    { field: "TOTAL_HU", title: "Total Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "OCCUPIED_HU", title: "Occupied Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "VACANT_HU", title: "Vacant Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "SEASONAL_HU", title: "Seasonal Housing", width: "150px", format: "{0:n0}" },
                    { field: "NON_SEASONAL_HU", title: "Non-Seasonal Housing", width: "150px", format: "{0:n0}" },
                    { field: "NON_SEASONAL_VACANT_HU", title: "Non-Seasonal Vacant Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "OWNER_OCC_HU", title: "Owner Occupied", width: "150px", format: "{0:n0}" },
                    { field: "RENTER_OCC_HU", title: "Renter Occupied", width: "150px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE_OWNER_HU", title: "Avgerage Household Size Owner Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "AVG_HH_SIZE_RENTER_HU", title: "Average Houshold Size Renter Housing Units", width: "150px", format: "{0:n0}" },
                    { field: "VACANCY_RATE", title: "Vacancy Rate", width: "150px", format: "{0:n0}" },
                    { field: "SEASONAL_VACANCY_RATE", title: "Seasonal Vacancy Rate", width: "150px", format: "{0:n0}" },
                    { field: "NON_SEASONAL_VACANCY_RATE", title: "Non-Seasonal Vacancy Rate", width: "150px", format: "{0:n0}" },
                    { field: "MEDIAN_VALUE", title: "Median Value", width: "150px", format: "{0:n0}" },
                    { field: "MEDIAN_GROSS_RENT", title: "Median Gross Rent", width: "150px", format: "{0:n0}" },
                    { field: "LT9GRADE", title: "Less than 9th Grade", width: "90px", format: "{0:n0}" },
                    { field: "NOHSDIPLOMA", title: "No High School Diploma", width: "90px", format: "{0:n0}" },
                    { field: "HSGRAD", title: "High School Graduate", width: "90px", format: "{0:n0}" },
                    { field: "SOMECOLLEGE", title: "Some College", width: "90px", format: "{0:n0}" },
                    { field: "ASSOCIATES", title: "Associates", width: "90px", format: "{0:n0}" },
                    { field: "BACHELORS", title: "Bachelors", width: "90px", format: "{0:n0}" },
                    { field: "GRADPROF", title: "Graduate / Professional", width: "90px", format: "{0:n0}" },
                    { field: "TOTAL_WORKERS_16PLUS", title: "Total Workers 16 Plus", width: "150px", format: "{0:n0}" },
                    { field: "CIVPOP16PLUS", title: "Civilian Population 16 Plus", width: "150px", format: "{0:n0}" },
                    { field: "CIVPOP18PLUS", title: "Civilian Population 18 Plus", width: "150px", format: "{0:n0}" },
                    { field: "VETERAN", title: "Veteran", width: "150px", format: "{0:n0}" },
                    { field: "CAR_TRUCK_VAN", title: "Car Truck Van", width: "90px", format: "{0:n0}" },
                    { field: "DROVE_ALONE", title: "Drove Alone", width: "90px", format: "{0:n0}" },
                    { field: "CARPOOLED", title: "Carpooled", width: "90px", format: "{0:n0}" },
                    { field: "BUS", title: "Bus", width: "90px", format: "{0:n0}" },
                    { field: "RAIL", title: "Rail", width: "90px", format: "{0:n0}" },
                    { field: "TAXI", title: "Taxi", width: "90px", format: "{0:n0}" },
                    { field: "MOTORCYCLE", title: "Motorcycle", width: "90px", format: "{0:n0}" },
                    { field: "BICYCLE", title: "Bicycle", width: "90px", format: "{0:n0}" },
                    { field: "WALKED", title: "Walked", width: "90px", format: "{0:n0}" },
                    { field: "OTHER_MEANS", title: "Other Means", width: "90px", format: "{0:n0}" },
                    { field: "WORKED_FROM_HOME", title: "Worked from Home", width: "90px", format: "{0:n0}" },
                    { field: "NO_VEHICLE", title: "No Vehicle", width: "90px", format: "{0:n0}" },
                    { field: "ONE_VEHICLE", title: "One Vehicle", width: "90px", format: "{0:n0}" },
                    { field: "TWO_VEHICLES", title: "Two Vehicles", width: "90px", format: "{0:n0}" },
                    { field: "THREE_VEHICLES", title: "Three Vehicles", width: "90px", format: "{0:n0}" },
                    { field: "FOUR_VEHICLES", title: "Four Vehicles", width: "90px", format: "{0:n0}" },
                    { field: "FIVE_PLUS_VEHICLES", title: "Five Plus Vehicles", width: "150px", format: "{0:n0}" },
                    { field: "MgBizSciArt", title: "Management, business, science, and arts occupations", width: "150px", format: "{0:n0}" },
                    { field: "MgBizFin", title: "Management, business, and financial occupations", width: "150px", format: "{0:n0}" },
                    { field: "Mgmt", title: "Management occupations", width: "150px", format: "{0:n0}" },
                    { field: "BizFin", title: "Business and financial operations occupations", width: "150px", format: "{0:n0}" },
                    { field: "CompEngSci", title: "Computer, engineering, and science occupations", width: "150px", format: "{0:n0}" },
                    { field: "CompMath", title: "Computer and mathematical occupations", width: "150px", format: "{0:n0}" },
                    { field: "ArchEngin", title: "Architecture and engineering occupations", width: "150px", format: "{0:n0}" },
                    { field: "LifePhysSocSci", title: "Life, physical, and social science occupations", width: "150px", format: "{0:n0}" },
                    { field: "EduLegComArtMedia", title: "Education, legal, community service, arts, and media occupations", width: "150px", format: "{0:n0}" },
                    { field: "CommSocServ", title: "Community and social service occupations", width: "150px", format: "{0:n0}" },
                    { field: "Legal", title: "Legal occupations", width: "150px", format: "{0:n0}" },
                    { field: "EduTrainLib", title: "Education, training, and library occupations", width: "150px", format: "{0:n0}" },
                    { field: "ArtEntSportMedia", title: "Arts, design, entertainment, sports, and media occupations", width: "150px", format: "{0:n0}" },
                    { field: "HealthTechnical", title: "Healthcare practitioners and technical occupations", width: "150px", format: "{0:n0}" },
                    { field: "HealthDiagTechOcc", title: "Health diagnosing and treating practitioners and other technical occupations", width: "350px", format: "{0:n0}" },
                    { field: "HealthTech", title: "Health technologists and technicians ", width: "150px", format: "{0:n0}" },
                    { field: "ServiceOcc", title: "Service occupations", width: "150px", format: "{0:n0}" },
                    { field: "HealthSupport", title: "Healthcare support occupations", width: "150px", format: "{0:n0}" },
                    { field: "ProtectiveServ", title: "Protective service occupations", width: "150px", format: "{0:n0}" },
                    { field: "Firefighting", title: "Firefighting and prevention, and other protective service workers including supervisors", width: "350px", format: "{0:n0}" },
                    { field: "LawEnforcement", title: "Law enforcement workers including supervisors", width: "150px", format: "{0:n0}" },
                    { field: "FoodPrep", title: "Food preparation and serving related occupations", width: "150px", format: "{0:n0}" },
                    { field: "GroundsMaint", title: "Building and grounds cleaning and maintenance occupations", width: "150px", format: "{0:n0}" },
                    { field: "PersonalCare", title: "Personal care and service occupations", width: "150px", format: "{0:n0}" },
                    { field: "SalesOfficeOcc", title: "Sales and office occupations", width: "150px", format: "{0:n0}" },
                    { field: "SalesOcc", title: "Sales and related occupations", width: "150px", format: "{0:n0}" },
                    { field: "OfficeAdmin", title: "Office and administrative support occupations", width: "150px", format: "{0:n0}" },
                    { field: "NatResources", title: "Natural resources, construction, and maintenance occupations", width: "250px", format: "{0:n0}" },
                    { field: "FarmFish", title: "Farming, fishing, and forestry occupations", width: "150px", format: "{0:n0}" },
                    { field: "Construction", title: "Construction and extraction occupations", width: "150px", format: "{0:n0}" },
                    { field: "InstRepair", title: "Installation, maintenance, and repair occupations", width: "150px", format: "{0:n0}" },
                    { field: "ProdTransMaterial", title: "Production, transportation, and material moving occupations", width: "250px", format: "{0:n0}" },
                    { field: "Production", title: "Production occupations", width: "150px", format: "{0:n0}" },
                    { field: "Transportation", title: "Transportation occupations", width: "150px", format: "{0:n0}" },
                    { field: "MaterialMoving", title: "Material moving occupations", width: "150px", format: "{0:n0}" }
                ];

                self.agePyramidFields = ["TOTAL_MALE", "M_Y5LESS5", "M_Y5TO9", "M_Y10TO14", "M_Y15TO17", "M_Y18TO19", "M_Y20", "M_Y21", "M_Y22TO24", "M_Y25TO29", "M_Y30TO34", "M_Y35TO39", "M_Y40TO44", "M_Y45TO49", "M_Y50TO54", "M_Y55TO59", "M_Y60TO61", "M_Y62TO64", "M_Y65TO66", "M_Y67TO69", "M_Y70TO74", "M_Y75TO79", "M_Y80TO84", "M_Y85UP", "TOTAL_FEMALE", "F_Y5LESS5", "F_Y5TO9", "F_Y10TO14", "F_Y15TO17", "F_Y18TO19", "F_Y20", "F_Y21", "F_Y22TO24", "F_Y25TO29", "F_Y30TO34", "F_Y35TO39", "F_Y40TO44", "F_Y45TO49", "F_Y50TO54", "F_Y55TO59", "F_Y60TO61", "F_Y62TO64", "F_Y65TO66", "F_Y67TO69", "F_Y70TO74", "F_Y75TO79", "F_Y80TO84", "F_Y85UP"];

                self.reports = {

                    stateSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/10",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/3",
                        whereClause: "NAME = 'Arizona State'",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/10",
                        compareACSUrl: self.ACS2014byBlockGroup + "/3",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        populateDropDown: false
                    },

                    countySummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/10",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/3",
                        whereClause: "NAME <> 'Arizona State'",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/10",
                        compareACSUrl: self.ACS2014byBlockGroup + "/3",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#countyComboBox"
                    },

                    cogSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/9",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/2",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/8",
                        compareACSUrl: self.ACS2014byBlockGroup + "/1",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "NAME",
                        summaryField: "NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#cogComboBox"
                    },
                    
                    placeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/8",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/1",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/8",
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
                        censusRestUrl: self.ACS2014byBlockGroup + "/11",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/4",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/11",
                        compareACSUrl: self.ACS2014byBlockGroup + "/4",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "SLDIST_NAME",
                        summaryField: "SLDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#legislativeComboBox"
                    },
                    congressionalSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/12",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/5",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/12",
                        compareACSUrl: self.ACS2014byBlockGroup + "/5",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "CDIST_NAME",
                        summaryField: "CDIST_NAME",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#congressionalComboBox"
                    },
                    zipCodeSummary: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/13",
                        ACSRestUrl: self.ACS2014byBlockGroup + "/6",
                        whereClause: "OBJECTID > -1",
                        compareCensusUrl: self.ACS2014byBlockGroup + "/13",
                        compareACSUrl: self.ACS2014byBlockGroup + "/6",
                        compareWhereClause: "OBJECTID > -1",
                        comparePlaceField: "ZIPCODE",
                        summaryField: "ZIPCODE",
                        isTimeVaryingData: false,
                        source: "American Community Survey 2010-2014 5yr",
                        dropdown: "#zipCodeComboBox"
                    },
                    censusTracts: {
                        name: "Demographic Summary",
                        censusRestUrl: self.ACS2014byBlockGroup + "/7",
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
