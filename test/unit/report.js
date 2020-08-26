// define(["mag/utilities"], function (reports) {
//     var { assert } = intern.getPlugin("chai");
//     var { registerSuite } = intern.getPlugin("interface.object");

//     console.log(reports);
//     registerSuite("Reports Module Test", {
//         "getSummableFields - returns correct array"() {
//             const inputArr = [
//                 {
//                     canSum: false,
//                     fieldName: "name",
//                 },
//                 {
//                     canSum: true,
//                     fieldName: "salary",
//                 },
//                 {
//                     canSum: false,
//                     fieldName: "date",
//                 },
//             ];

//             const returnArr = utilities.getSummableFields(inputArr);
//             assert.deepEqual(returnArr, ["salary"]);
//         },

//         "getSummableFields - returns empty array - input string"() {
//             const returnArr = utilities.getSummableFields("test");
//             assert.deepEqual(returnArr, []);
//         },

//         "getSummableFields - returns empty array - input empty array"() {
//             const returnArr = utilities.getSummableFields([]);
//             assert.deepEqual(returnArr, []);
//         },

//         summarizeFeatures() {
//             const testFeatures = [
//                 {
//                     attributes: {
//                         name: "jill",
//                         salary: 100,
//                     },
//                 },
//                 {
//                     attributes: {
//                         name: "jim",
//                         salary: 400,
//                     },
//                 },
//                 {
//                     attributes: {
//                         name: "sally",
//                         salary: 1000,
//                     },
//                 },
//             ];

//             const inputFields = [
//                 {
//                     canSum: false,
//                     fieldName: "name",
//                 },
//                 {
//                     canSum: true,
//                     fieldName: "salary",
//                 },
//             ];

//             const returnval = utilities.summarizeFeatures(
//                 testFeatures,
//                 inputFields
//             );
//             assert.equal(returnval["salary"], 1500);
//         },
//     });
// });
