var { registerSuite } = intern.getPlugin("interface.object");
var { assert } = intern.getPlugin("chai");
registerSuite("About Panel", {
    "panel opens": function () {
        return this.remote
            .get("src/index.html")
            .findByCssSelector('[panel-target="about-view"]')
            .moveMouseTo(39, 18)
            .clickMouseButton(0)
            .getVisibleText()
            .then((text) => {
                assert.equal(text, "About");
            });
    },
});
