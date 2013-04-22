var ISDEBUG = true;
var LOG = (message: any, ...optionalParams: any[]) => { if (ISDEBUG) console.log(message, optionalParams) }

interface Array {
    single(callbackfn: (value: _element, index: number, array: _element[]) => bool, thisArg?: any): _element;
}

if (!Array.prototype.single) {
    Array.prototype.single = function (fun) {
        "use strict";
        var res = this.filter(fun);

        if (res.length == 0)
            return null;

        if (res.length > 1)
            throw new RangeError("Multiple matches found");

        return res[0];
    };
}