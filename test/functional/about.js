const { registerSuite } = intern.getPlugin('interface.object');
const { assert } = intern.getPlugin('chai');
    registerSuite('About', {
        'about opens': function () {
            return this.remote
            .get('src/index.html')
            .findById('sidebar')
            .findByCssSelector('[panel-target="about-view"]')
            .moveMouseTo(39, 18)
            .clickMouseButton(0);
        }
    });