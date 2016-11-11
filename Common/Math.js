// -*- indent-tabs-mode: nil -*-
//
// Math.js
//
//
// conventions:
//  functions that allocate a new object are prefixed 'a'.  Otherwise they are
//  either stateless or destructive.
//
// todo:
//  the biggest thing is we don't even attempt to handle complex numbers.  So a polynomial
//  with complex roots - I don't even know what we do there.  But nothing sensible.

"use strict";

var Mathx = new function ()
{
    // degreesToRad
    this.degreesToRad = function (degrees)
    {
        return degrees * (Math.PI / 180);
    };
    
    // zAlloc
    this.zAlloc = function (dim)
    {
        var ret = new Array(dim);
        for (var i=0; i<dim; ++i)
            ret[i] = 0.0;
        return ret;
    };
    
    // create a new poly
    //
    // coefficients is in reverse order, so
    // a0 + a1*x + a2*x^2 + ... + an * x^n
    this.Poly = function (param)
    {
        var coefficients = null;
        
        if (param instanceof Mathx.Poly)
            coefficients = param.coefficients.concat();
        else
            coefficients = param;
        
        if (!coefficients)
            coefficients = [];
        
        this.coefficients = coefficients;

        // eval
        //
        // evaluate this poly at x
        this.eval = function (x)
        {
            var curx = 1;
            var sum = 0;
            for (var i=0,n=this.coefficients.length; i<n; ++i, curx *= x)
                sum += curx * this.coefficients[i];
            return sum;
        };
        
        // add
        //
        this.add = function (q)
        {
            // extend length
            var diff = q.coefficients.length - this.coefficients.length;
            if (diff > 0)
                this.coefficients = this.coefficients.concat(Mathx.zAlloc(diff));
            
            for (var i=0,qn=q.coefficients.length; i<qn; ++i)
                this.coefficients[i] += q.coefficients[i];
        };
        
        // mul
        //
        this.mul = function (q)
        {
            var tn = this.coefficients.length;
            var xn = q.coefficients.length;
            var x;
            var polySum = Mathx.zAlloc(xn + this.coefficients.length);
            for (x=0; x<xn; ++x)
            {
                var c = q.coefficients[x];
                for (var j=0; j<tn; ++j)
                    polySum[x + j] += c * this.coefficients[j];
            }
            
            while (polySum.length>0 && polySum[polySum.length-1] == 0)
                polySum.length--;
            this.coefficients = polySum.reverse();
        };
        
        // order
        //
        // Returns the order of the polynomial.
        this.order = function ()
        {
            return this.coefficients.length-1;
        };
        
        // adifferentiate
        //
        // Computes derivative f' of this, allocates new polynomial
        this.aDifferentiate = function ()
        {
            var newCoefficients = new Array(this.coefficients.length-1);
            var coeffLength = this.coefficients.length;
            for (var p=1; p<coeffLength; ++p)
            {
                newCoefficients[p-1] = p * this.coefficients[p];
            }
            
            var newPoly = new Mathx.Poly(newCoefficients);
            return newPoly;
        };
        
        // getRootEstimate
        //
        // Returns min(n*abs(a0/a1), nthroot (abs(a0/an))) which will be a root of
        // this polynomial.
        this.getRootEstimate = function ()
        {
            var thisOrder = this.order();
            if (thisOrder < 0)
                throw "getRootEstimate: Insufficient data to provide root estimate";
            if (thisOrder == 0)
                return this.coefficients[0]; // constant value
            if (thisOrder == 1)
                return -this.coefficients[0]/this.coefficients[1]; // solve explicitly
            
            // >= order 2
            var n = this.coefficients.length-1;
            var a0 = this.coefficients[this.coefficients.length-1];
            var a1 = this.coefficients[this.coefficients.length-2];
            var an = this.coefficients[0];
            
            var ret = Math.min(n * Math.abs(a0/a1), Math.pow(Math.abs(a0 / an), 1/n));
            return ret;
        };

        // traceStr
        this.traceStr = function (msg)
        {
            var msg2 = msg ? msg : "";
            var n = this.coefficients.length;
            var str = "(";
            for (var i=0; i<n; ++i)
            {
                var c = this.coefficients[i];
                var s = c<0? " - ":" + ";                
                var c1 = Math.abs(c);
                var cStr = (c1==1 && i) ? "" :c1;
                
                if (i)
                    str += s;
                else if (c<0)
                    str += "-";
                
                str += cStr;
                if (i>0)
                    str += "x^"+i;
            }
            str += ")";
            if (msg)
                return msg + " " + str;
            else
                return str;
        };
        
        // trace
        this.trace = function (msg)
        {
            console.log(this.traceStr(msg));
        };

        // aRoots
        //
        // Returns array of all roots of function
        this.aRoots = function ()
        {
            if (this.coefficients.length <= 1)
                return null;
            
            // console.log("aRoots: ");
            // this.trace("  arg0:");
            
            var roots = [];
            var numRoots = this.coefficients.length-1;
            
            // find smallest root
            var poly = this;
            var q = new Mathx.Poly([0, 1]);
            while (poly && poly.order() >= 2)
            {
                var rootEstimate = poly.getSingleRoot();
                // console.log("  getSingleRoot:"+rootEstimate);
                q.coefficients[0] = -rootEstimate;
                
                // push root estimate
                roots.push(rootEstimate);
                
                var divRes = poly.aDivide(q);
                if (divRes)
                {
                    // console.log("  "+poly.traceStr()+"/"+q.traceStr()+"="+divRes.poly.traceStr());
                    poly = divRes.poly;
                }
            }
            
            // console.log("  polyFinal::"+poly.getSingleRoot());
            if (poly)
                roots.push(poly.getSingleRoot());
            
            // exclude non-real roots.
            // - jiv fixme: handle complex roots
            var i=0;
            while (i<roots.length)
            {
                var e = this.eval(roots[i]);
                var diff = Mathx.floatDist(e, 0.0);
                if (diff > 1e-3)
                    roots.splice(i, 1);
                else
                    i++;
            }
            
            return roots.sort();
        };
        
        // getCauchyBound
        //
        // Returns compoung object upper/lower
        this.getCauchyBound = function ()
        {
            if (this.coefficients.length < 1)
                return null;
            
            var ret = new Object;
            ret.upper = 0.0;
            ret.lower = 0.0;
            
            var i=0;
            
            // negative polynomial
            var polyP = new Mathx.Poly(this);
            for (i=0; i<polyP.coefficients.length; ++i)
                polyP.coefficients[i] = -Math.abs(polyP.coefficients[i]);
            
            // fix the coefficient signs
            polyP.coefficients[0] = Math.abs(polyP.coefficients[0]);
            
            // positive polynomial
            var polyQ = new Mathx.Poly(this);
            for (i=0; i<polyQ.coefficients.length; ++i)
                polyQ.coefficients[i] = Math.abs(polyQ.coefficients[i]);
            
            // fix the coefficient signs
            polyQ.coefficients[0] = Math.abs(polyQ.coefficients[0]);
            polyQ.coefficients[polyQ.coefficients.length-1] = -polyQ.coefficients[polyQ.coefficients.length-1];
            
            ret.upper = polyP.getSingleRoot();
            ret.lower = polyQ.getSingleRoot();

            return ret;
        };

        // getSingleRoot
        //
        // Gets a single root.
        this.getSingleRoot = function ()
        {
            var dPoly = this.aDifferentiate();
            
            var rootEstimate = this.getRootEstimate();
            var prevRootEstimate = 2*rootEstimate;
            var x = 0;
            
            var eRoot = 1000;
            
            // NR iterate until we're within
            var numIterations = 0;
            while (Math.abs(eRoot)>1e-6 && numIterations++<10000)
            {
                // evaluated value at this root
                eRoot = this.eval(rootEstimate);
                
                var newRootEstimate = rootEstimate - (eRoot / dPoly.eval(rootEstimate));
                
                prevRootEstimate = rootEstimate;
                rootEstimate = newRootEstimate;
            }
            
            var rootEstimateCeil = Math.ceil(rootEstimate);
            var rootEstimateFloor = Math.floor(rootEstimate);
            if (Mathx.floatDist(rootEstimate, rootEstimateCeil) < 1e-4)
                return rootEstimateCeil;
            if (Mathx.floatDist(rootEstimate, rootEstimateFloor) < 1e-4)
                return rootEstimateFloor;
            
            return rootEstimate;
        };
        
        // aDivideResult
        //
        // Return object by aDivide
        this.aDivideResult = function (poly, remainder, dividend)
        {
            this.poly = poly;
            
            if (remainder)
                this.remainder = remainder;
            else
                this.remainder = null;
            
            if (this.remainderDividend)
                this.remainderDividend = dividend;
            else
                this.remainderDividend = null;                
        };
        
        // aDivide
        // Performs polynomial long division.  Allocates a "aDivideResult" object to hold the results.
        //
        this.aDivide = function (p)
        {
            if (p.coefficients.length > this.coefficients.length)
                throw "aDivide fail: p too big.";
            
            if (p.coefficients.length != 2)
                throw "aDivide fail: "+p.coefficients.length+" != 2";
            
            var r = [];
            
            // copy coefficients
            var q = this.coefficients.concat();
            
            // console.log("aDivide:");
            // console.log("    "+this.traceStr("this:"));
            // console.log("    "+p.traceStr("arg0:"));
            
            var iteration=0;
            
            // iterate coefficients
            while (q.length)
            {
                // our current power
                var q0 = q[q.length-1];
                
                // remove current power
                q.pop();
                
                // push multiplier for this coefficient
                var p0 = p.coefficients[p.coefficients.length-1];
                r.unshift(q0 / p0);
                
                var p1 = p.coefficients[p.coefficients.length-2];
                var pp1 = (q0 / p0) * p1;
                
                // console.log("    iteration:"+(iteration++));
                // console.log("        q0:"+q0);
                // console.log("        r0:"+(q0/p0));
                // console.log("        p0:"+p0);
                // console.log("        p1:"+p1);
                // console.log("        pp1:"+pp1);
                // console.log("        q:["+q.join(',')+']');
                
                if (q.length == 0)
                    throw "Error!";
                
                if (q.length == 1)
                {
                    var aDivideResult;
                    
                    if (Mathx.floatDist(q[0], pp1) < 1e-3)
                        aDivideResult = new this.aDivideResult(new Mathx.Poly(r));
                    else
                        aDivideResult = new this.aDivideResult(new Mathx.Poly(r), q[q.length-1], p);
                    
                    return aDivideResult;
                }
                
                q[q.length-1] -= pp1;
            }
            
            throw "Error2";
            return null;
        };

        // drawPoly
        this.draw = function(context)
        {
            var rangeX = 4.0;
            var startX = -2.5;
            
            var offsetX = 200;
            var offsetY = 300;
            var biasX = 10;
            var biasY = -10;
            
            // draw axis lines at origin
            context.strokeStyle = "rgb(255,0,0)";
            context.beginPath();
            context.moveTo(-100+offsetX, offsetY);
            context.lineTo( 100+offsetX, offsetY);
            context.moveTo(    offsetX, -100+offsetY);
            context.lineTo(    offsetX,  100+offsetY);
            context.stroke();
            
            // evaluate poly a bunch
            var maxI=10000;
            for (var i=0; i<maxI; ++i)
            {
                var xVal = startX + rangeX * i/maxI;
                var yVal = this.eval(startX + rangeX * i/maxI);
                
                var xNextVal = startX + rangeX * (i+1)/maxI;
                var yNextVal = this.eval(startX + rangeX * (i+1)/maxI);
                
                // draw next segment
                context.strokeStyle = "rgb(0,0,0)";
                context.beginPath();
                context.moveTo(offsetX+biasX*xVal, offsetY+biasY*yVal);
                context.lineTo(offsetX+biasX*xNextVal, offsetY+biasY*yNextVal);
                context.stroke();
                
                // draw cross at intersection points
                if (Math.abs(yVal)<0.001 || yVal*yNextVal<0)
                {
                    var xMidPoint = (xVal+xNextVal)*0.5;
                    var yMidPoint = (yVal+yNextVal)*0.5;
                    
                    context.strokeStyle = "rgb(0,255,0)";
                    context.beginPath();
                    context.moveTo(-10+offsetX+biasX*xMidPoint, -10+offsetY+biasY*yMidPoint);
                    context.lineTo( 10+offsetX+biasX*xMidPoint, 10+offsetY+biasY*yMidPoint);
                    context.moveTo(-10+offsetX+biasX*xMidPoint, 10+offsetY+biasY*yMidPoint);
                    context.lineTo( 10+offsetX+biasX*xMidPoint, -10+offsetY+biasY*yMidPoint);
                    context.stroke();            
                }
            }
        };
    };
    
    // floatDist
    //
    // returns distance between two floats
    this.floatDist = function (a, b)
    {
        return Math.abs(a-b);
    };
    
    // polyTest
    //
    // unit tests function
    this.polyTest = function ()
    {
        var test0 = function ()
        {
            console.log("test0");
            console.log("    Testing evaluation, getSingleRoot, getCauchyBound");
            
            var polyTest0 = new Mathx.Poly([1, -3.7, -7.4, -10.8, -10.8, -6.8]);
            var singleRoot = polyTest0.getSingleRoot();
            var cauchyBound = polyTest0.getCauchyBound();
            
            polyTest0.trace("    test0:");
            console.log("    singleRoot: " + singleRoot);
            console.log("    atRoot: " + polyTest0.eval(singleRoot));
            console.log("    cauchyBound.upper: " + cauchyBound.upper);
            console.log("    cauchyBound.lower: " + cauchyBound.lower);
        };

        var test1 = function ()
        {
            console.log("test1");
            console.log("    Testing polynomial division");
            
            var polyQ = new Mathx.Poly([2, -4, 2]);
            var polyDividend = new Mathx.Poly([-1, 1]);
            var polyR = polyQ.aDivide(polyDividend);
            
            polyQ.trace("    polyQ:");
            polyDividend.trace("    polyDividend:");
            polyR.poly.trace("    polyQ / polyDividend:");
        };

        var test2 = function ()
        {
            console.log("test2");
            console.log("    Testing polynomial addition");
            
            var poly0 = new Mathx.Poly([-2, 1, 1]);
            var poly1 = new Mathx.Poly([-1, 1]);
            poly0.trace("    poly0:");
            poly1.trace("    poly1:");
            poly1.add(poly0);
            poly1.trace("    poly0 + poly1:");
        };
        
        var test3 = function ()
        {
            console.log("test3");
            console.log("    Testing polynomial root finding");
            
            var poly0 = new Mathx.Poly([12, 8, -7, -2, 1]);
            poly0.trace("    poly0:");
            var r = poly0.aRoots();
            console.log("    roots: "+r.join(","));
        };
        
        var test4 = function()
        {
            console.log("test3");
            console.log("    Testing real-value testing of polynomial root finding");
            
            var poly0 = new Mathx.Poly([2610, 17455.25, 51920.499999999985, 116292.24999999997, -157735.49999999994, 58278.24999999997]);
            poly0.trace("    poly0:");
            var r = poly0.aRoots();
            console.log("    roots: "+r.join(","));            
        };
        
        test0();
        test1();
        test2();
        test3();
        test4();
    };

    // isNan
    this.isNan = function (num)
    {
        return (num != num);
    };
    
    // prec
    this.prec = function(n, p)
    {
        var tenp = Math.pow(10, p);
        return Math.round(n*tenp)/(1.0*tenp);
    };
    
    // lengthSqr
    //
    // Returns the order of the polynomial.
    this.lengthSqr = function (x, y)
    {
        return x*x+y*y;
    };
};
