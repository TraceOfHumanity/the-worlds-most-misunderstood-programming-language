"use strict";

console.log("this", this);

function doLogThis(){
  console.log("this", this);
}

const obj = {
  name: "John",
  doLogThis: doLogThis
};

obj.doLogThis();

doLogThis();

const obj2 = {
  name: "Jane",
  doLogThis: function(){
    console.log("this", this);
  }
};

var doLogThis2 = obj2.doLogThis;
doLogThis2();