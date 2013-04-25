var ISDEBUG = true;
var LOG = (message: any, ...optionalParams: any[]) => { if (ISDEBUG) console.log(message, optionalParams) }

interface Array<T> {
    single(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T;
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

interface String {
    format(...args: any[]): string;
}

if (!String.prototype.format) {
    String.prototype.format = function (args) {
        var template = this;
        for (var i = 0; i < args.length; i++) {
            template.replace("{" + i + "}", args[i]);
        }
        return this;
    };
}