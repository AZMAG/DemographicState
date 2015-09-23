(function () {
    "use strict";

    define([

    ],

        function () {

            ko.bindingHandlers.joinUniqueId = {

                init: function (element, valueAccessor) {
                    var value = valueAccessor();
                    value.id = value.id || ko.bindingHandlers.joinUniqueId.prefix + (++ko.bindingHandlers.joinUniqueId.counter);
                    element.id = value.id;
                },
                counter: 0,
                prefix: "queryJoin"
            }
        });
} ());