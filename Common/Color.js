// -*- indent-tabs-mode: nil -*-
// Color.js

"use strict";

function Color()
{
    this.r = arguments.length>0 ? arguments[0] : 0;
    this.g = arguments.length>1 ? arguments[1] : 0;
    this.b = arguments.length>2 ? arguments[2] : 0;
    this.a = arguments.length>3 ? arguments[3] : 1;
    
    this.toStyle = function ()
    {
        return "rgb("+(255*this.r)+","+(255*this.g)+","+(255*this.b)+")";
    };
}

// red
Color.Red = new Color(1,0,0,0);

// green
Color.Green = new Color(0,1,0,0);
    
// blue
Color.Blue = new Color(0,0,1,0);
    
// purple
Color.Purple = new Color(1,0,1,0);
    
// orange red
Color.OrangeRed = new Color (1.0, (69.0/255.0), 0.0);

// yellow
Color.Yellow = new Color(1.0, 1.0, 0.0);

// dark yellow
Color.DarkYellow = new Color(0.8, 0.8, 0.0);

// dark green
Color.DarkGreen = new Color(0.0, 0.8, 0.0);

// saddle brown
Color.SaddleBrown = new Color(139.0/255, 69.0/255, 19/255.0);

// saddle black
Color.Black = new Color(0.0/255, 0.0/255, 0.0/255);

// debug Colors
Color.debugColors =
[
    Color.Red,
    Color.Green,
    Color.Blue,
    Color.Purple,
    Color.OrangeRed,
    Color.Yellow,
    Color.DarkGreen,
    Color.SaddleBrown
];

Color.debugStyle =
[
    "rgb(255,0,0)",
    "rgb(0,255,0)",
    "rgb(0,0,255)",
    "rgb(255,0,255)",
    "rgb(0,0,0)",
    "rgb(255,255,0)",
    "rgb(80,80,80)"
];
