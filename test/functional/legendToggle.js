var { registerSuite } = intern.getPlugin("interface.object");
var { assert } = intern.getPlugin("chai");
registerSuite("Toggle Panel", {
    "Does it toggle?": function () {
        return this.remote
            .get("src/index.html")
            .findByCssSelector('[panel-target="legend"]')
            .click()
            .execute(
                // send a callback to the browser
                function (selector) {
                    var elem = document.querySelector("#legend");
                    return $("#legend").is(":visible");
                }
            )
            .then((visible) => {
                assert.equal(visible, false);
            });
    },
});
