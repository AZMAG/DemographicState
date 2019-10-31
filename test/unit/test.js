define([
    'mag/test'
], function (test) {
    var { assert } = intern.getPlugin('chai');
    var { registerSuite } = intern.getPlugin('interface.object');
    registerSuite('Simple Module Test', {
        'Simple test'() {
            assert.equal(1, 1);
        },
        'Another Simple test'() {
            assert.equal(1, 1);
        }
    });
});