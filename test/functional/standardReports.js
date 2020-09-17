var { registerSuite } = intern.getPlugin("interface.object");
var { assert } = intern.getPlugin("chai");
registerSuite("Standard Reports", {
    "panel opens": function () {
        return this.remote
            .get("src/index.html")
            .findByCssSelector('[panel-target="reports-view"]')
            .moveMouseTo(39, 18)
            .clickMouseButton(0)
            .getVisibleText()
            .then((text) => {
                assert.equal(text, "Reports");
            });
    },
    // "maricopa county pop check": async function () {
    //     // let test = await this.remote
    //     //     .get("src/index.html")
    //     //     .findByCssSelector('[panel-target="reports-view"]')
    //     //     .moveMouseTo(39, 18)
    //     //     .clickMouseButton(0)
    //     //     .sleep(500);

    //     // let test2 = await this.remote
    //     //     .get("src/index.html")
    //     //     .findByCssSelector('[panel-target="reports-view"]')
    //     //     .moveMouseTo(39, 18)
    //     //     .clickMouseButton(0)
    //     //     .sleep(500)
    //     //     .findByCssSelector("#standardReports");
    //     // .findByCssSelector('[panel-target="reports-view"]')
    //     // .moveMouseTo(39, 18)
    //     // .clickMouseButton(0)
    //     // .sleep(1000)
    //     // .findById("reportType")
    //     // .getAttribute("value");
    //     console.log(test2);
    //     return test;
    // },
});
