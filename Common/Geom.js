// -*- indent-tabs-mode: nil -*-
// Geom.use

"js strict";

var Geom =
{
    kShapeTypeBox: 1,
    kShapeTypeCircle: 2
};

// Geom.isTriangleCcw
//
// p0 -> GVec
// p1 -> GVec
// p2 -> GVec
Geom.isTriangleCcw = function (p0, p1, p2)
{
    var c0 = GVec.append(GVec.aVecSub(p0, p1), 0.0);
    var c1 = GVec.append(GVec.aVecSub(p0, p2), 0.0);
    var c2 = GVec.vecCross(c0, c1);
    
    return GVec.vecDot3(GVec.aI(0,0,-1), c2) > 0.01;
};

// Geom.insidePolygon
//
// returns true if x/y point is inside 2d polygon with verticles p = [v0, v1, ...], false otherwise
Geom.insidePolygon2d = function (x, y, p)
{
    var point = GVec.aI(x,y);
    
    var low=0,high=p.length;
    do
    {
        var mid = (low+high)/2;
        if (this.isTriangleCcw(p[0], p[mid], point))
            low = mid;
        else
            high = mid;
    } while (low+1<high);
    
    if (low == 0 || high == p.length)
        return false;
    
    return this.isTriangleCcw(p[low], p[high], point);
};

// Geom.unitTest
Geom.unitTest = function ()
{
    var testPoint = GVec.aI(14, 10);
    var polyGon = [ GVec.aI(5, 5),
                    GVec.aI(5, 15),
                    GVec.aI(15, 15),
                    GVec.aI(15, 5) ];
    
    var ccwTest = this.insidePolygon2d(testPoint.data[0], testPoint.data[1], polyGon);
    console.log("point: ("+testPoint.data[0]+","+testPoint.data[1]+") polygon "+(ccwTest?"true":"false"));
};

var Shape = function (shape)
{
    this.shape = shape;
};

// Box
var Box = function (p0, p1, p2, p3)
{
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
};
Box.prototype = new Shape(Geom.kShapeTypeBox);

// Circle
var Circle = function (c, r)
{
    this.center = c;
    this.radius = r;
};
Circle.prototype = new Shape(Geom.kShapeTypeCircle);

// LineSegment
function LineSegment (start, end)
{
    if (start.x <= end.x)
    {
        this.start = start;
        this.end = end;
    }
    else
    {
        this.start = end;
        this.end = start;
    }

    Object.seal(this);
}

LineSegment.prototype.theta = function ()
{
    var angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
    Debug.log("angle: %f", angle);
    return -angle;
};

LineSegment.prototype.dir = function ()
{
    return GVec.aVecSub(this.end, this.start);
};
