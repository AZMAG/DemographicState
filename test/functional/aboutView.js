var { registerSuite } = intern.getPlugin('interface.object');
var { assert } = intern.getPlugin('chai');
    registerSuite('About View', {
        'page opens': function () {
            return this.remote
            .get('src/app/views/about-view.html')
            .findByCssSelector('[class="col-sm-10 panelHeaderText"]')
            .getVisibleText()
            .then(text => {
                assert.equal(text, 'About Arizona Demographics');
            });
        }
    });