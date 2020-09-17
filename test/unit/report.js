define(["mag/utilities"], function (reports) {
    var { assert } = intern.getPlugin("chai");
    var { registerSuite } = intern.getPlugin("interface.object");

    console.log(reports);
    registerSuite("Reports Module Test", {});
});
