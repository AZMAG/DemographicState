(function() {

    "use strict";

    define(

        function() {
            var qbConfig = new function() {
                var self = this;
                self.CompareOperators = {
                    string: ["=", "<", "<=", ">=", ">"],
                    number: ["=", "<", "<=", ">=", ">"],
                    date: ["=", "<", "<=", ">=", ">"]
                };
            };
            return qbConfig;
        }
    );
}());