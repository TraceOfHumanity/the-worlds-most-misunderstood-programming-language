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