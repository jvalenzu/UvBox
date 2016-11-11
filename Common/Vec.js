// -*- indent-tabs-mode: nil -*-
//
// todo: unit test

"use strict";

// GVec
function GVec(numElements)
{
    this.numElements = numElements;
    this.data = new Array(numElements);
    
    if (numElements >= 2)
    {
        this.__defineGetter__("x", function() { return this.data[0]; });
        this.__defineSetter__("x", function(v) { this.data[0] = v; });
        
        this.__defineGetter__("y", function() { return this.data[1]; });
        this.__defineSetter__("y", function(v) { this.data[1] = v; });
        
        if (numElements >= 3)
        {
            this.__defineGetter__("z", function() { return this.data[2]; });
            this.__defineSetter__("z", function(v) { this.data[2] = v; });
        }
        if (numElements >= 4)
        {
            this.__defineGetter__("w", function() { return this.data[3]; });
            this.__defineSetter__("w", function(v) { this.data[3] = v; });
        }
    }

    this.clone = function ()
    {
        var ret = new GVec(this.numElements);
        this.copy(ret);
        return ret;
    };

    // dimension
    this.dimension = function()
    {
        return numElements;
    };
    
    // copy
    this.copy = function(dest)
    {
        if (this.numElements > dest.numElements)
            throw "numElements mismatch!";
        
        for (var i=0; i<this.data.length; ++i)
            dest.data[i] = this.data[i];
        return this;
    };

    // lengthSqr
    this.lengthSqr = function()
    {
        var sum = 0.0;
        for (var i=0,n=this.numElements; i<n; ++i)
            sum += this.data[i]*this.data[i];
        return sum;
    };
    
    // divide
    this.divide = function(div)
    {
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] /= div;
    };
    
    // aDivide
    this.aDivide = function()
    {
        var x = this.clone();
        for (var i=0,n=x.numElements; i<n; ++i)
            x.data[i] /= arguments.length==1 ? arguments[0] : arguments[i];
        return x;
    };
    
    // normalizeScalarMul
    this.normalizeScalarMul = function(scalar)
    {
        var len = scalar/Math.sqrt(this.lengthSqr());
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] *= len;
        return this;
    };

    // scalarMul
    this.scalarMul = function(scalar)
    {
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] *= scalar;
        return this;
    };
    
    // normalize
    this.normalize = function()
    {
        var len = 1/Math.sqrt(this.lengthSqr());
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] *= len;
    };

    // aNormalize
    this.aNormalize = function()
    {
        var x = this.clone();
        x.normalize();
        return x;
    };
    
    // scale
    this.scale = function(scalar)
    {
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] *= scalar;
        return this;
    };
    
    // dump
    this.dump = function ()
    {
        console.log(this);
    };
    
    this.toString = function()
    {
        var msg = arguments.length ? (arguments[0] + ":") : "[";
        for (var i=0; i<numElements; ++i)
        {
            msg += this.data[i].toFixed(3);
            if (i != numElements-1)
                msg += ', ';
        }
        msg += "]";
        return msg;
    };


    // GVec.uniformNorm
    this.uniformNorm = function ()
    {
        var m = Math.abs(this.data[0]);
        for (var i=1,n=this.numElements; i<n; ++i)
            m = Math.max(m, Math.abs(this.data[i]));
        return m;
    };
    
    this.sub = function (v1)
    {
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] -= v1.data[i];
    };
    
    this.mul = function (v1)
    {
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] *= (typeof v1 == "number") ? v1 : v1.data[i];
    };
    
    this.add = function (v1)
    {
        for (var i=0,n=this.numElements; i<n; ++i)
            this.data[i] += (typeof v1 == "number") ? v1 : v1.data[i];
    };
    
    this.aMul = function (v1)
    {
        var ret = this.clone();
        ret.mul(v1);
        return ret;
    };

    this.aVecMul = function (x)
    {
        var ret = this.clone();
        ret.mul(x);
        return ret;
    };
    
    Object.seal(this);
};

// vecDot2
GVec.vecDot2 = function(v1, v2)
{
    return v1.data[0]*v2.data[0] + v1.data[1]*v2.data[1];
};

// scale
GVec.scale = function(v, scalar)
{
    return v.clone().scale(scalar);
};

// vecDot3
GVec.vecDot3 = function(v1, v2)
{
    return v1.data[0]*v2.data[0] + v1.data[1]*v2.data[1] + v1.data[2]*v2.data[2];
};

// vecDistSqr
GVec.vecDistSqr = function(v0, v1)
{
    var d = GVec.aVecSub(v0, v1);
    return d.lengthSqr();
};

// distance
GVec.distance = function()
{
    if (arguments.length == 0)
        return 0.0;

    var v1i = arguments.length/2;
    var s = 0.0;
    for (var i=0; i<arguments.length/2; ++i)
    {
        var a = arguments[i] - arguments[v1i+i];
        s += a*a;
    }
    s = Math.sqrt(s);
    return s;
};

// vecCross
GVec.vecCross = function(v0, v1)
{
    var i = v0.data[1] * v1.data[2] - v0.data[2] * v1.data[1];
    var j = v0.data[0] * v1.data[2] - v0.data[2] * v1.data[0];
    var k = v0.data[0] * v1.data[1] - v0.data[1] * v1.data[0];
    
    // return [i, -j,  k];
    return GVec.aI(i, -j, k);
};

// GVec.aI
GVec.aI = function ()
{
    if (arguments.length == 0)
        throw "Invalid argument list";
    
    var g = new GVec(arguments.length);
    for (var i=0; i<arguments.length; ++i)
        g.data[i] = arguments[i];
    return g;
};

// GVec.i
GVec.i = function (d)
{
    if (arguments.length == 1)
        throw "Invalid argument list";
    for (var i=1; i<arguments.length; ++i)
        d.data[i-1] = arguments[i];
    return d;
};

// GVec.append
GVec.append = function (v, value)
{
    v.numElements++;
    v.data.push(value);
    return v;
};

// GVec.dot
GVec.dot = function (v0, v1)
{
    if (v0.numElements != v1.numElements)
        throw "Dimension mismatch";
    
    var s = 0;
    for (var i=0; i<v0.numElements; ++i)
        s += v0.data[i] * v1.data[i];
    return s;
};

// GVec.aVecSub
GVec.aVecSub = function (v0, v1)
{
    if (!v0 || !v1)
        debugger;
    
    if (v0.numElements != v1.numElements)
    {
        debugger;
        throw "Invalid vector arguments";
    }
    
    var ret = new GVec(v0.numElements);
    GVec.vecSub(ret, v0, v1);
    return ret;
};

// GVec.vecSub
GVec.vecSub = function (dest, v0, v1)
{
    if ((v0.numElements != v1.numElements) || (v0.numElements != dest.numElements))
    {
        debugger;
        throw "Invalid vector arguments";
    }
    for (var i=0,n=v0.numElements; i<n; ++i)
        dest.data[i] = v0.data[i] - v1.data[i];
};

GVec.uvToRay = function (v0)
{
    for (var i=0; i<v0.numElements; ++i)
        v0.data[i] = (v0.data[i] * 2.0) - 1.0;
    return v0;
};

GVec.rayToUv = function (v0)
{
    for (var i=0; i<v0.numElements; ++i)
        v0.data[i] = (v0.data[i] + 1.0) * 0.5;
    return v0;
};

// GVec.vecScalarMulAndAdd
//
// dest = v0 * s + v1
GVec.vecScalarMulAndAdd = function (dest, v0, s, v1)
{
    if (v0.numElements != v1.numElements)
        throw "Invalid vector arguments";
    
    for (var i=0; i<v0.numElements; ++i)
        dest.data[i] = v0.data[i] * s + v1.data[i];
};

// GVec.aVecScalarMulAndAdd
//
// dest = v0 * s + v1
GVec.aVecScalarMulAndAdd = function (v0, s, v1)
{
    if (v0.numElements != v1.numElements)
        throw "Invalid vector arguments";
    
    var dest = new GVec(v0.numElements);
    GVec.vecScalarMulAndAdd(dest, v0, s, v1);
    return dest;
};

// GVec.vecAddMulScalar
//
// dest = (v0 + v1) * s
GVec.vecAddMulScalar = function (dest, v0, v1, s)
{
    if ((v0.numElements != v1.numElements) || (v0.numElements != dest.numElements))
        throw "Invalid vector arguments";
    
    for (var i=0; i<v0.numElements; ++i)
        dest.data[i] = (v0.data[i] + v1.data[i]) * s;
};

// GVec.aVecAddMulScalar
//
// (v0 + v1) * s
GVec.aVecAddMulScalar = function (v0, v1, s)
{
    if (v0.numElements != v1.numElements)
        throw "Invalid vector arguments";
    
    var dest = new GVec(v0.numElements);
    GVec.vecAddMulScalar (dest, v0, v1, s);
    return dest;
};


// GVec.vecSubMulScalar
//
// dest = (v0 - v1) * s
GVec.vecSubMulScalar = function (dest, v0, v1, s)
{
    if ((v0.numElements != v1.numElements) || (v0.numElements != dest.numElements))
        throw "Invalid vector arguments";
    
    for (var i=0; i<v0.numElements; ++i)
        dest.data[i] = (v0.data[i] - v1.data[i]) * s;
};

// GVec.aVecSubMulScalar
//
// (v0 - v1) * s
GVec.aVecSubMulScalar = function (v0, v1, s)
{
    var dest = new GVec(v0.numElements);
    GVec.vecSubMulScalar(dest, v0, v1, s);
    return dest;
};

// GVec.aVecMulScalar
GVec.aVecMulScalar = function (v, s)
{
    var ret = new GVec(v.numElements);
    GVec.vecMulScalar(ret, v, s);
    return ret;
};

// GVec.vecMulScalar
GVec.vecMulScalar = function (dest, v, s)
{
    for (var i=0,n=v.numElements; i<n; ++i)
        dest.data[i] = v.data[i] * s;
};

// GVec.vecMul
// multiply by components
GVec.vecMul = function (dest, v1, v2)
{
    for (var i=0,n=v1.numElements; i<n; ++i)
        dest.data[i] = v1.data[i] * v2.data[i];
};

// GVec.nvec_w
GVec.nvec_w = function (v, w)
{
    v.data[3] = w;
};

// GVec.vecAdd
//
// add two vectors, overwriting first argument
GVec.vecAdd = function(v0, v1, v2)
{
    if ((v0.numElements != v1.numElements) || (v0.numElements != v2.numElements))
        throw "Incompatible numElements";
    
    for (var i=0,n=v0.numElements; i<n; ++i)
        v0.data[i] = v1.data[i] + v2.data[i];
};

// GVec.aVecAdd
//
// add two vectors, overwriting first argument
GVec.aVecAdd = function(v0, v1)
{
    if (v0.numElements != v1.numElements)
        throw "Incompatible numElements";
    
    var ret = new GVec(v0.numElements);
    GVec.vecAdd(ret, v0, v1);
    return ret;
};

// GMat
function GMat(numRows, numCols)
{
    this.numRows = numRows;
    this.numCols = numCols;
    this.data = new Array(numRows);
    for (var i=0; i<numRows; ++i)
        this.data[i] = new GVec(numCols);

    if (numRows >= 2)
    {
        this.__defineGetter__("x", function() { return this.data[0]; });
        this.__defineSetter__("x", function(v) { this.data[0] = v; });
        
        this.__defineGetter__("y", function() { return this.data[1]; });
        this.__defineSetter__("y", function(v) { this.data[1] = v; });
        
        if (numRows >= 3)
        {
            this.__defineGetter__("z", function() { return this.data[2]; });
            this.__defineSetter__("z", function(v) { this.data[2] = v; });
        }
        if (numRows >= 4)
        {
            this.__defineGetter__("w", function() { return this.data[3]; });
            this.__defineSetter__("w", function(v) { this.data[3] = v; });
        }
    }
    
    // normalizeRows
    this.normalizeRows = function()
    {
        for (var i=0,n=this.numRows; i<n; ++i)
        {
            this.data[i].normalize();
        }
    };
    
    // getRow
    this.getRow = function(row)
    {
        if (row >= this.numRows)
            throw "Illegal row operation";
        
        return this.data[row];
    };
    
    // getColumnVector
    this.getColumnVector = function(dest, col)
    {
        if (col >= this.numCols)
            throw "Illegal column operation";
        
        for (var i=0; i<numRows; ++i)
            dest.data[i] = this.data[i].data[col];
    };
    
    // clone
    this.clone = function()
    {
        var ret = new GMat(this.numRows, this.numCols);
        for (var i=0; i<numRows; ++i)
        {
            for (var j=0; j<numCols; ++j)
            {
                ret.data[i].data[j] = this.data[i].data[j];
            }
        }
        return ret;
    };
    
    // splice
    this.splice = function(row, v)
    {
        if (row >= this.numRows)
            throw "Illegal row operation";
        
        for (var i=0; i<numCols; ++i)
            this.data[row].data[i] = v.data[i];
    };
    
    // spliceImmediate
    this.spliceImmediate = function()
    {
        var row = arguments[0];
        if (row >= this.numRows)
            throw "Illegal row operation";
        
        for (var i=1; i<arguments.length; ++i)
            this.data[row].data[i-1] = arguments[i];
    };
    
    // transposeCopy
    this.transposeCopy = function()
    {
        var ret = new GMat(this.numCols, this.numRows);
        for (var i=0; i<this.numCols; ++i)
        {
            for (var j=0; j<this.numRows; ++j)
            {
                ret.data[j].data[i] = this.data[i].data[j];
            }
        }
        return ret;
    };
    
    // makeIdent
    this.makeIdent = function()
    {
        for (var i=0; i<this.numRows; ++i)
        {
            for (var j=0; j<this.numCols; ++j)
            {
                if (i==j)
                    this.data[i].data[j] = 1.0;
                else
                    this.data[i].data[j] = 0.0;
            }
        }
    };

    // i ("index")
    this.i = function (rIndex, cIndex)
    {
        return this.data[rIndex].data[cIndex];
    };

    // f ("flat index")
    // this awful function converts a flat index into column/row indices
    // for purposes of dereferencing some data
    this.f = function (index)
    {
        var rIndex = Math.floor(index / this.numCols);
        var cIndex = Math.floor(index % this.numCols);
        return this.i(rIndex, cIndex);
    };
    
    // dump
    this.dump = function ()
    {
        console.log(this);
    };

    this.toString = function ()
    {
        var str = (!arguments.length ? "" : arguments[0] + " ") + "[ ";
        for (var i=0; i<numRows; ++i)
        {
            if (i != 0)
                str += "  ";
            str += this.data[i];
            if (i != numCols-1)
                str += ",\n";
        }
        return str + " ]";
    };

    // fill this matrix with zeros
    this.zeroFill = function()
    {
        for (var i=0; i<this.numRows; ++i)
        {
            for (var j=0; j<this.numCols; ++j)
            {
                this.data[i].data[j] = 0.0;
            }
        }
    };
    
    this.toString = function ()
    {
        var str = (!arguments.length ? "" : arguments[0] + " ") + "[ ";
        for (var i=0; i<numRows; ++i)
        {
            if (i != 0)
                str += "  ";
            str += this.data[i];
            if (i != numCols-1)
                str += ",\n";
        }
        return str + " ]";
    };

    Object.seal(this);
};

// ident
GMat.ident = function()
{
    if (arguments.length != 2)
        throw "Insufficent number of arguments";
    
    var r = arguments[0];
    var c = arguments[1];

    var ret = new GMat(r, c);
    ret.makeIdent();
    return ret;
};

// concatScale
GMat.concatScale = function(mat, scalar)
{
    for (var i=0; i<this.numRows; ++i)
    {
        for (var j=0; j<this.numCols; ++j)
        {
            mat.data[i].data[j] *= scalar;
        }
    }
    return mat;
};


// scale
GMat.scale = function(mat, scalar)
{
    for (var i=0; i<mat.numRows; ++i)
    {
        mat.data[i].scale(scalar);
    }
    return mat;
};

// aZeroFill
//
// Return a zero filled matrix of arbitrary dimension
GMat.aZeroFill = function(r, c)
{
    var gmat = new GMat(r, c);
    return gmat.zeroFill();
};

// aRot2d
GMat.aRot2d = function(theta)
{
    var ret = new GMat(2, 2);
    return GMat.rot2d(ret, theta);
};

// rot2d
GMat.rot2d = function(ret, theta)
{
    var c = Math.cos(theta);
    var s = Math.sin(theta);
    
    ret.x.x = c;
    ret.y.y = c;
    
    ret.x.y = -s;
    ret.y.x = s;
    
    return ret;
};

// GMat.aVecMulMat
// v0 -  m dimensional vector
// gm1 - GMat mxp
//
// Left multiply vector by mat, return row vector (result transpose).  Dimension is nxp.
GMat.aVecMulMat = function(v0, gm1)
{
    var ret = new GVec(v0.numElements);
    GMat.vecMulMat(ret, v0, gm1);
    return ret;
};

// GMat.aVecMulMat
// v0 -  m dimensional vector
// gm1 - GMat mxp
//
GMat.vecMulMat = function(ret, v0, gm1)
{
    if (!v0 || !gm1)
        debugger;

    if (v0.numElements != gm1.numRows)
        throw "Illegal dimension operation!";
    
    for (var j=0; j<gm1.numRows; ++j)
    {
        for (var i=0,n=v0.numElements; i<n; ++i)
        {
            var dot = GVec.dot(v0, gm1.data[j]);
            ret.data[j] = dot;
        }
    }
    
    return ret;
};

// GMat.aLeftVecMulMat
// v0 -  m dimensional vector
// gm1 - GMat mxp
//
// Left multiply vector by mat, return row vector (result transpose).  Dimension is nxp.
GMat.aLeftVecMulMat = function(v0, gm1)
{
    var ret = new GVec(v0.numElements);
    GMat.leftVecMulMat(ret, v0, gm1);
    return ret;
};

// GMat.leftVecMulMat
// v0 -  m dimensional vector
// gm1 - GMat mxp
//
GMat.leftVecMulMat = function(ret, v0, gm1)
{
    if (!v0 || !gm1)
        debugger;

    if (v0.numElements != gm1.numRows)
        throw "Illegal dimension operation!";
    
    for (var j=0; j<gm1.numCols; ++j)
    {
        var d = 0.0;
        for (var k=0; k<gm1.numRows; ++k)
        {
            d += gm1.data[k].data[j] * v0.data[k];
        }
        ret.data[j] = d;
    }
    
    return ret;    
};


// GMat.aMatMulMat
// gm0 - GMat nxm
// gm1 - GMat mxp
//
// Multiply two gmats, return new result.  Dimension is nxp
GMat.aMatMulMat = function(gm0, gm1)
{
    if (!gm0 || !gm1)
        debugger;
    
    if (gm0.numCols != gm1.numRows)
    {
        debugger;
        throw "Illegal dimension operation!";
    }
    
    var ret = new GMat(gm0.numRows, gm1.numCols);
    var gm1Col = new GVec(gm1.numRows);
    for (var j=0; j<gm1.numCols; ++j)
    {
        gm1.getColumnVector(gm1Col, j);
        
        for (var i=0; i<gm0.numRows; ++i)
        {
            var gm0Row = gm0.getRow(i);
            ret.data[i].data[j] = GVec.dot(gm1Col, gm0Row);
        }
    }

    return ret;
};

// GMat.aMatInvert
// 
// Allocate return value, invert using gaussian elimination
GMat.aMatInvert = function (m)
{
    var ret = new GMat(m.numRows, m.numCols);
    GMat.matInvert(ret, m);
    return ret;
};

// GMat.matInvert
// 
// Invert using gaussian elimination
GMat.matInvert = function(dest, m)
{
    var indices = [];
    
    // determine our pivot order
    for (var col=0; col<m.numCols; ++col)
    {
        var ndx = -1;
        var val = -1.0;
        for (var row=0; row<m.numRows; ++row)
        {
            if (indices.indexOf(row) >= 0)
                continue;
            
            var scalar = Math.abs(m.data[row].data[col]);
            if (scalar > val)
            {
                val = scalar;
                ndx = row;
            }
        }
        
        // save index
        indices.push(ndx);
    }

    var d;
    var v;
    
    // initialize our return value (the augmented portion of our matrix)
    dest.makeIdent();
    
    var source_copy = m.clone();
    
    // iterate over each pivot column
    for (d=0; d<m.numRows; ++d)
    {
        var row = indices[d];
        var col_ndx = d;
        
        var scale;
        
        // d pivot row to 1.0f
        {
            scale = 1.0 / source_copy.data[row].data[col_ndx];
            if (Mathx.isNan(scale) || Math.abs(scale) < 0.001)
                throw "Invalid scale " + source_copy.data[row].data[col_ndx];
            
            // overwrite source_copy[row]
            GVec.vecMulScalar(source_copy.data[row], source_copy.data[row], scale);
            
            // overwrite dest[row]
            GVec.vecMulScalar(dest.data[row], dest.data[row], scale);
        }

        // iterate over the other rows, adding -(row_value / pivot_value)
        for (v=0; v<m.numRows; ++v)
        {
            if (v != row)
            {
                scale = -source_copy.data[v].data[col_ndx];
                if (scale == 0.0)
                    continue;
                
                if (Mathx.isNan(scale) || Math.abs(scale) < 0.001)
                    throw "invalid scale: " + scale;
                
                // Add set source_copy[v] to scalar * source_copy[row] + source_copy[v]
                GVec.vecScalarMulAndAdd(source_copy.data[v], source_copy.data[row], scale, source_copy.data[v]);
                
                // change dest
                GVec.vecScalarMulAndAdd(dest.data[v], dest.data[row], scale, dest.data[v]);
            }
        }
    }
    
    // reverse permute
    var dest_copy = dest.clone();
    for (var d1=0; d1<dest.numRows; ++d1)
        dest_copy.splice(indices[d1], dest.data[d1]);
    
    for (d1=0; d1<dest.numRows; ++d1)
        dest.splice(d1, dest_copy.data[d1]);    
};

// GVec.generateLineSegmentTransformMatrix
GVec.generateLineSegmentTransformMatrix = function (lineSegment)
{
    var g = new GMat(4,4);
    g.zeroFill();
    g.x.x = g.y.y = g.z.z = g.w.w = 1.0;
    GMat.rot2d(g, lineSegment.theta());
    
    return g;
};
