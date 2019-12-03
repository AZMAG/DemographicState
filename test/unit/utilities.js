define([
    'magcore/utils/formatter'
], function (formatter) {
    var { assert } = intern.getPlugin('chai');
    var { registerSuite } = intern.getPlugin('interface.object');
    registerSuite('Utilities Module Test', {
        'Number with commas - 567'() {
            var inputval = 567;
            var returnval = formatter.numberWithCommas(inputval);
            assert.equal(returnval, "567");
        },
        'Number with commas - 1000'() {
            var inputval = 1000;
            var returnval = formatter.numberWithCommas(inputval);
            assert.equal(returnval, "1,000");
        },
        'Number with commas - 9876543'() {
            var inputval = 9876543;
            var returnval = formatter.numberWithCommas(inputval);
            assert.equal(returnval, "9,876,543");
        },
        'Chart tooltip'() {
            var value = 5131;
            var category = "Under 5 years";
            var returnval = formatter.chartTooltip(value, category);
            assert.equal(returnval, "5,131 <r> Under 5 years");
        },
        'Value axis template'() {
            var inputval = 4000;
            var returnval = formatter.valueAxisTemplate(inputval);
            assert.equal(returnval, "4,000");
        }
    });
});