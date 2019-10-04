define([
    'mag/test'
], function (test) {
    const { registerSuite } = intern.getPlugin('interface.object');
    const { assert } = intern.getPlugin('chai');
    registerSuite({
        name: 'Simple Module Test',
        'Simple test': function () {
                assert.strictEqual(1, 1, 'Equals 1');
        }
    })
});

// define([
//     'mag/test'
// ], function (test) {
    
//     const { describe, it } = intern.getPlugin('interface.bdd');
//     const { expect } = intern.getPlugin('chai');

//     describe('Simple Module Test', function () {
//         it('should work', function () {
//                 expect(1).equal(1);
//         });
//     });
// });