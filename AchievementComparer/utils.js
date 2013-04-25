var ISDEBUG = true;
var LOG = function (message) {
    var optionalParams = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        optionalParams[_i] = arguments[_i + 1];
    }
    if (ISDEBUG) {
        console.log(message, optionalParams);
    }
};
if (!Array.prototype.single) {
    Array.prototype.single = function (callbackfn) {
        "use strict";
        var res = this.filter(callbackfn);
        if (res.length == 0) {
            return null;
        }
        if (res.length > 1) {
            throw new RangeError("Multiple matches found");
        }
        return res[0];
    };
}
if (!String.prototype.format) {
    String.prototype.format = function (args) {
        "use strict";
        var template = this;
        for(var i = 0; i < args.length; i++) {
            if (template.indexOf("{" + i + "}") > -1) {
                template.replace("{" + i + "}", args[i]);
            }
        }
        return this;
    };
}
//@ sourceMappingURL=utils.js.map
