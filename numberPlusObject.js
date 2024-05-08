'use strict';

var theTestArr = [1, 2, 3];

var theArrSum = {
  valueOf: function() {
    return (
      Array.prototype.reduce.call( this, ((thePrev, theCurr) => thePrev + theCurr), 0 )
    )
  }
}

Reflect.setPrototypeOf( theTestArr, theArrSum );

console.log( theTestArr + 1)