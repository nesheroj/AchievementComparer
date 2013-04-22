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
