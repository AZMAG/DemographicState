define([
    'mag/test'
], function (test) {
    const { assert } = intern.getPlugin('chai');
    const { registerSuite } = intern.getPlugin('interface.object');
    registerSuite('Simple Module Test', {
        'Simple test' () {
                assert.equal(1, 1);
        },
        'Another Simple test' () {
                assert.equal(1, 1);
        },
        'Another Simple test that fails' () {
                assert.equal(1, 0);
        }
    });
});