"use strict";

let wordnikWords = "http://api.wordnik.com/v4/words.json/",
    wordnikWord = "http://api.wordnik.com/v4/word.json/",
    apiKey = "",
    wordObj;


/*asyncFunction()
.then(function(val) {
    console.log("Yeah!! " + val);
    return asyncFunction2();
})
.then(function(val) {
    console.log("Second promise: " + val);
});*/

fetch(wordnikWords + "randomWord" + apiKey)
.then(function(response) {
    wordObj = response;
    //console.log(wordObj);
    return response.json();
})
.then(function(data) {
    console.log(data.word);
    return fetch(wordnikWord + data.word + "/definitions" + apiKey);
})
.then(function(def) {
    //console.log(def);
    return def.json();
})
.then(function(def) {
    console.log(def);
})
.catch(function(err) {
    console.log(err);
});

console.log("See this is asynchronous!");