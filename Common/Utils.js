// -*- indent-tabs-mode: nil -*-
//
// Utils.js

"use strict";

var Utils = {};
Utils.curry = function (fn, scope) {
    if (fn == undefined)
        debugger;
    
    scope = scope || window;
    var args = [];
    for (var i = 2, len = arguments.length; i < len; ++i) {
        args.push(arguments[i]);
    }
    return function() {
        var args2 = [];
        for (var i = 0; i < arguments.length; i++) {
            args2.push(arguments[i]);
        }
        var argstotal = args.concat(args2);
        return fn.apply(scope, argstotal);
    };
};

// ws
//
// returns a string with as many space characters as len.
Utils.ws = function (len) {
    var ret = "";
    
    while (len-- > 0)
        ret += " ";
    
    return ret;
};

// clamp
Utils.clamp = function (s, min, max) {
    if (s>max)
        return max;
    if (s<min)
        return min;
    return s;
};

// comes from prototype.js; this is simply easier on the eyes and fingers
function $(id)
{
    return document.getElementById(id);
}
