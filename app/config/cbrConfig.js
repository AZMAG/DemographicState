(function() {

    "use strict";

    define(

        function() {
            var cbrConfig = new function() {
                var self = this;
                self.mapServices = {
                    Census2010byBlockGroup: appConfig.layerInfo[5].url
                };

                self.thematicMaps = [
                    // population related maps
                    {
                        NodeType: "cat",
                        Name: "Population",
                        ShortName: "Population",
                        Description: "Contains population related variables",
                        items: [{
                                NodeType: "map",
                                LayerId: 0,
                                Name: "Total Population",
                                ShortName: "Total Population",
                                Service: "Census2010byBlockGroup",
                                DefaultColorRamp: "OrRd",
                                DefaultColorScheme: "Sequential",
                                Description: "",
                                Source: "Census 2010, by Block Group",
                                FieldName: "TOT_POP",
                                Type: "number",
                                Placeholder: "7293"
                            }, {
                                NodeType: "map",
                                LayerId: 0,
                                Name: "Population Density",
                                ShortName: "People per Sq Mi",
                                Service: "Census2010byBlockGroup",
                                DefaultColorRamp: "OrRd",
                                DefaultColorScheme: "Sequential",
                                Description: "",
                                Source: "Census 2010, by Block Group",
                                FieldName: "POP_PER_SQMI",
                                Type: "number",
                                Placeholder: "39292.78"
                            }, {
                                NodeType: "map",
                                LayerId: 0,
                                Name: "Percent Minority Population",
                                ShortName: "% Minority Population",
                                Service: "Census2010byBlockGroup",
                                DefaultColorRamp: "OrRd",
                                DefaultColorScheme: "Sequential",
                                Description: "",
                                Source: "Census 2010, by Block Group",
                                FieldName: "PERCENT_MINORITY",
                                AsPercentages: true,
                                Type: "percent"
                            },

                            // age cohort maps
                            {
                                NodeType: "cat",
                                Name: "Age",
                                ShortName: "Age",
                                Description: "Population by Age",
                                items: [{
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Median Age",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Median Age",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "MEDIAN_AGE",
                                    Type: "number",
                                    Placeholder: "82.7"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Under Age 5",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Under Age 5",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_UNDER5",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Age 5 to 17",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Age 5 - 17",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_5TO17",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Age 18 to 34",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Age 18 - 34",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_18TO34",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Age 35 to 49",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Age 35 - 49",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_35TO49",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Age 50 to 64",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Age 50 - 64",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_50TO64",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Age 65 to 84",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Age 65 - 84",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_65TO84",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population Age 85 and Over",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Age 85 and Over",
                                    DefaultColorRamp: "YlGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_AGE_85PLUS",
                                    AsPercentages: true,
                                    Type: "percent"
                                }]
                            },

                            // pop by race maps
                            {
                                NodeType: "cat",
                                Name: "Population by Race",
                                ShortName: "Population by Race",
                                Description: "...",
                                items: [{
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent White",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% White",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_WHITE",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Black",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Black",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_BLACK",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Asian",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Asian",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_ASIAN",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Native American",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Native American",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_NATIVE",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Pacific Islander",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Pacific Islander",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_PACIFIC",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Two Or More Races",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Two or More Races ",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_TWO_OR_MORE",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Other Race",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Other Race",
                                    DefaultColorRamp: "YlGnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_OTHER",
                                    AsPercentages: true,
                                    Type: "percent"
                                }]
                            },

                            // pop by ethnicity maps
                            {
                                NodeType: "cat",
                                Name: "Population by Ethnicity",
                                ShortName: "Population by Ethnicity",
                                Description: "...",
                                items: [{
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Hispanic",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Hispanic",
                                    DefaultColorRamp: "GnBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "Census 2010, by Block Group",
                                    FieldName: "PERCENT_HISPANIC",
                                    AsPercentages: true,
                                    Type: "percent"
                                }]
                            },

                            // household income
                            {
                                NodeType: "cat",
                                Name: "Household Income",
                                ShortName: "Household Income",
                                Description: "...",
                                items: [{
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Total Households",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Total Households",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "TOTAL_HOUSEHOLDS",
                                    Type: "number",
                                    Placeholder: "1831"

                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Household Density",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Households per Sq Mi",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "HOUSEHOLDS_PER_SQMI",
                                    Type: "number",
                                    Placeholder: "18641.23"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Median Household Income",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Median Income",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "MEDIAN_HOUSEHOLD_INCOME",
                                    Type: "number",
                                    Placeholder: "250002"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Households with Income Less Than 25K",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Income Less Than 25K",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_HH_LESS_THAN_25K",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Households with Income 25K to 50K",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Income 25k to 50k",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_HH_25K_TO_49K",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Households with Income 50K to 100K",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Income 50k to 100k",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_HH_50K_TO_99K",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Households with Income 100K Or More",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Income 100K or More",
                                    DefaultColorRamp: "PuBuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_HH_100K_OR_MORE",
                                    AsPercentages: true,
                                    Type: "percent"
                                }]
                            },

                            // poverty maps
                            {
                                NodeType: "cat",
                                Name: "Poverty",
                                ShortName: "Poverty",
                                Description: "...",
                                items: [{
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Total Families",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Total Families",
                                    DefaultColorRamp: "BuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "TOTAL_FAMILY",
                                    Type: "number",
                                    Placeholder: "1480"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Family Density",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Families per Sq Mi",
                                    DefaultColorRamp: "BuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "FAMILIES_PER_SQMI",
                                    Type: "number",
                                    Placeholder: "9527"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent Families Below Poverty Level",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Families Below Poverty Level",
                                    DefaultColorRamp: "BuGn",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_POVERTY",
                                    AsPercentages: true,
                                    Type: "percent"
                                }]
                            },


                            // educational attainment
                            {
                                NodeType: "cat",
                                Name: "Educational Attainment",
                                ShortName: "Educational Attainment",
                                Description: "...",
                                items: [{
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Population 25 or Older",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Population 25 or Older",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "POPULATION_25_YEARS_AND_OVER",
                                    Type: "number",
                                    Placeholder: "6409"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Population Density (age 25 and over)",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "Population 25 and Older per Sq Mi",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "POP25PLUS_PER_SQMI",
                                    Type: "number",
                                    Placeholder: "20708"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population with Education Less than 9th Grade",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Less than 9th Grade",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_LT9GRADE",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population with Education 9th to 12th Grade",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% 9th to 12th Grade",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_NOHSDIPLOMA",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population High School Graduates",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% High School / GED",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_HSGRAD",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population with Some College",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Some College",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_SOMECOLLEGE",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population with Associates Degree",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Associates Degree",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_ASSOCIATES",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population with Bachelors Degree",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Bachelors Degree",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_BACHELORS",
                                    AsPercentages: true,
                                    Type: "percent"
                                }, {
                                    NodeType: "map",
                                    LayerId: 0,
                                    Name: "Percent of Population with Graduate or Professional Degree",
                                    Service: "Census2010byBlockGroup",
                                    ShortName: "% Graduate or Professional Degree",
                                    DefaultColorRamp: "PuBu",
                                    DefaultColorScheme: "Sequential",
                                    Description: "",
                                    Source: "American Community Survey 2008 - 2012, by Block Group",
                                    FieldName: "PERCENT_GRADPROF",
                                    AsPercentages: true,
                                    Type: "percent"
                                }]
                            }
                        ]
                    },

                    // housing maps
                    {
                        NodeType: "cat",
                        Name: "Housing",
                        ShortName: "Housing",
                        Description: "Contain housing units related variables",
                        items: [{
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Total Housing Units",
                            Service: "Census2010byBlockGroup",
                            ShortName: "Total Housing Units",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "Census 2010, by Block Group",
                            FieldName: "TOTAL_HU",
                            Type: "number",
                            Placeholder: "3063"
                        }, {
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Housing Unit Density",
                            Service: "Census2010byBlockGroup",
                            ShortName: "Housing Units per Sq Mi",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "Census 2010, by Block Group",
                            FieldName: "HU_PER_SQMI ",
                            Type: "number",
                            Placeholder: "23096"
                        }, {
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Vacancy Rate",
                            Service: "Census2010byBlockGroup",
                            ShortName: "Vacancy Rate",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "Census 2010, by Block Group",
                            FieldName: "VACANCY_RATE",
                            AsPercentages: true,
                            Type: "percent"
                        }, {
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Percent Seasonal Units",
                            Service: "Census2010byBlockGroup",
                            ShortName: "% Seasonal Units",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "Census 2010, by Block Group",
                            FieldName: "PERCENT_SEASONAL",
                            AsPercentages: true,
                            Type: "percent"
                        }, {
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Non-Seasonal Vacancy Rate",
                            Service: "Census2010byBlockGroup",
                            ShortName: "Non-Seasonal Vacancy Rate",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "Census 2010, by Block Group",
                            FieldName: "NON_SEASONAL_VACANCY_RATE",
                            AsPercentages: true,
                            Type: "percent"
                        }, {
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Median Home Value",
                            Service: "Census2010byBlockGroup",
                            ShortName: "Median Home Value",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "American Community Survey 2008 - 2012, by Block Group",
                            FieldName: "MEDIAN_VALUE",
                            Type: "number",
                            Placeholder: "1000002"
                        }, {
                            NodeType: "map",
                            LayerId: 0,
                            Name: "Median Gross Rent",
                            Service: "Census2010byBlockGroup",
                            ShortName: "Median Gross Rent",
                            DefaultColorRamp: "PuRd",
                            DefaultColorScheme: "Sequential",
                            Description: "",
                            Source: "American Community Survey 2008 - 2012, by Block Group",
                            FieldName: "MEDIAN_GROSS_RENT",
                            Type: "number",
                            Placeholder: "2002"
                        }, {
                            NodeType: "cat",
                            Name: "Tenure",
                            ShortName: "Tenure",
                            Description: "...",
                            items: [{
                                NodeType: "map",
                                LayerId: 0,
                                Name: "Percent Owner Occupied",
                                Service: "Census2010byBlockGroup",
                                ShortName: "% Owner Occupied",
                                DefaultColorRamp: "YlOrBr",
                                DefaultColorScheme: "Sequential",
                                Description: "",
                                Source: "Census 2010, by Block Group",
                                FieldName: "PERCENT_OWNER_OCCUPIED",
                                AsPercentages: true,
                                Type: "percent"
                            }, {
                                NodeType: "map",
                                LayerId: 0,
                                Name: "Percent Renter Occupied",
                                Service: "Census2010byBlockGroup",
                                ShortName: "% Renter Occupied",
                                DefaultColorRamp: "YlOrBr",
                                DefaultColorScheme: "Sequential",
                                Description: "",
                                Source: "Census 2010, by Block Group",
                                FieldName: "PERCENT_RENTER_OCCUPIED",
                                AsPercentages: true,
                                Type: "percent"
                            }]
                        }]
                    }
                ];
            };
            return cbrConfig;
        }
    );
}());