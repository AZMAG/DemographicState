define(["mag/utilities"], function (utilities) {
    var { assert } = intern.getPlugin("chai");
    var { registerSuite } = intern.getPlugin("interface.object");
    registerSuite("Utilities Module Test", {
        "Number with commas - 567"() {
            var inputval = 567;
            var returnval = utilities.numberWithCommas(inputval);
            assert.equal(returnval, "5637");
        },
        "Number with commas - 1000"() {
            var inputval = 1000;
            var returnval = utilities.numberWithCommas(inputval);
            assert.equal(returnval, "1,000");
        },
        "Number with commas - 9876543"() {
            var inputval = 9876543;
            var returnval = utilities.numberWithCommas(inputval);
            assert.equal(returnval, "9,876,543");
        },
        "Chart tooltip"() {
            var value = 5131;
            var category = "Under 5 years";
            var returnval = utilities.chartTooltip(value, category);
            assert.equal(returnval, "5,131 <r> Under 5 years");
        },
        "Value axis template"() {
            var inputval = 4000;
            var returnval = utilities.valueAxisTemplate(inputval);
            assert.equal(returnval, "4,000");
        },

        "getSummableFields - returns correct array"() {
            const inputArr = [
                {
                    canSum: false,
                    fieldName: "name",
                },
                {
                    canSum: true,
                    fieldName: "salary",
                },
                {
                    canSum: false,
                    fieldName: "date",
                },
            ];

            const returnArr = utilities.getSummableFields(inputArr);
            assert.deepEqual(returnArr, ["salary"]);
        },

        "getSummableFields - returns empty array - input string"() {
            const returnArr = utilities.getSummableFields("test");
            assert.deepEqual(returnArr, []);
        },

        "getSummableFields - returns empty array - input empty array"() {
            const returnArr = utilities.getSummableFields([]);
            assert.deepEqual(returnArr, []);
        },

        summarizeFeatures() {
            const testFeatures = [
                {
                    attributes: {
                        name: "jill",
                        salary: 100,
                    },
                },
                {
                    attributes: {
                        name: "jim",
                        salary: 400,
                    },
                },
                {
                    attributes: {
                        name: "sally",
                        salary: 1000,
                    },
                },
            ];

            const inputFields = [
                {
                    canSum: false,
                    fieldName: "name",
                },
                {
                    canSum: true,
                    fieldName: "salary",
                },
            ];

            const returnval = utilities.summarizeFeatures(
                testFeatures,
                inputFields
            );
            assert.equal(returnval["salary"], 1500);
        },
    });
});
