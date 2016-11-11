// -*- indent-tabs-mode: nil -*-

"use strict";

var Debug = {};

Debug.toHex = function (v)
{
    var ret = "";
    while (v)
    {
        ret += "0123456789abcdef"[v % 16];
        v = Math.trunc(v/16);
    }
    return ret.split('').reverse().join('');
};

Debug.toBin = function (v)
{
    var ret = "";
    while (v)
    {
        ret += "01"[v & 1];
        v = Math.trunc(v/2);
    }
    return ret.split('').reverse().join('');
};

Debug.log = function ()
{
    var itr=1;
    var output = "";
    var fmt = arguments[0];
    for (var i=0; i<fmt.length; ++i)
    {
        var c = fmt[i];
        if (c != '%')
        {
            output += c;
        }
        else
        {
            c = fmt[i+1];
            var value = arguments[itr++];
            switch (c)
            {
                default:
                {
                    break;
                }
                case 'x':
                case 'X':
                {
                    value = "0x" + this.toHex(value, 16);
                    ++i;
                    break;
                }
                case 'b':
                case 'B':
                {
                    value = "0x" + this.toBin(value, 2);
                    ++i;
                    break;
                }
            }
            output += value;
        }
    }
    
    console.log(output);
};
