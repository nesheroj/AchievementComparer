var ISDEBUG = true;
var LOG = function (message) {
    var optionalParams = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        optionalParams[_i] = arguments[_i + 1];
    }
    if(ISDEBUG) {
        console.log(message, optionalParams);
    }
};
if(!Array.prototype.single) {
    Array.prototype.single = function (fun) {
        "use strict";
        var res = this.filter(fun);
        if(res.length == 0) {
            return null;
        }
        if(res.length > 1) {
            throw new RangeError("Multiple matches found");
        }
        return res[0];
    };
}
//@ sourceMappingURL=utils.js.map
