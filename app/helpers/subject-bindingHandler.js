(function () {
    "use strict";

    define([

    ],

        function () {

            ko.bindingHandlers.subjectUniqueId = {

                init: function (element, valueAccessor) {
                    var value = valueAccessor();
                    value.id = value.id || ko.bindingHandlers.subjectUniqueId.prefix + (++ko.bindingHandlers.subjectUniqueId.counter);
                    element.id = value.id;
                },
                counter: 0,
                prefix: "querySubject"
            };
        });
} ());