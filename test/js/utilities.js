define([
    'mag/utilities'
], function (utilities) {
    const { assert } = intern.getPlugin('chai');
    const { registerSuite } = intern.getPlugin('interface.object');
    registerSuite('Utilities Module Test', {        
        // 'QS' () {
        //         var inputval = "init";
        //         var returnval = utilities.qs(inputval);
        //         assert.equal(returnval, "init");
        // },
        'Number with commas - 567' () {
                var inputval = 567;
                var returnval = utilities.numberWithCommas(inputval);
                assert.equal(returnval, "567");
        },
        'Number with commas - 1000' () {
                var inputval = 1000;
                var returnval = utilities.numberWithCommas(inputval);
                assert.equal(returnval, "1,000");
        },
        'Number with commas - 9876543' () {
            var inputval = 9876543;
            var returnval = utilities.numberWithCommas(inputval);
            assert.equal(returnval, "9,876,543");
        },
        'Chart tooltip' () {
                var value = 5131;
                var category = "Under 5 years";
                var returnval = utilities.chartTooltip(value, category);
                assert.equal(returnval, "5,131 <r> Under 5 years");
        },
        'Value axis template' () {
                var inputval = 4000;
                var returnval = utilities.valueAxisTemplate(inputval);
                assert.equal(returnval, "4,000");
        },
        // 'Wrap text' () {
        //         var inputval = "The quick brown fox jumps over the lazy dog";
        //         var returnval = utilities.wrapText(inputval);
                
        //         var bool_return = 1
        //         var split_string = returnval.split("\n");
        //         var i;
        //         for (i = 0; i < split_string.length; i++) {
        //             text += split_string[i] + "<br>";
        //             if (text.length > 12) {
        //                 bool_return = 0
        //             }
        //         }

        //         assert.equal(bool_return, 1);
        // }
    });
});