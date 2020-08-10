/** deep copy VS shallow copy 
 * 라이브러리: load*/ 
let x = {
    a:1,
    b:2
};

// deep copy
let x_copy = x;
x_copy.a = 3;
console.log("deep copy:" + x_copy.a);// 3 메모리를 참조
console.log("x.a :" + x.a);// 3

// shallow copy
let x_shallow = {...x};
x_shallow.a = 1;
console.log("shallow copy:" + x_shallow.a);// 1
console.log("x.a :" + x.a);// 3

/** FOR ~ OF */
for (var i in 'string') { console.log(i); } // 0 1 2 3 4 5 
for (var i of 'string') { console.log(i); } // s t r i n g
let array2 = [3, 5, 7];
array2.foo = 'bar';
for (var j in array2) { console.log(j); } // 1 2 foo
for (var j of array2) { console.log(j); } // 3 5 7
for (const [idx, val] of array2.entries()) {
    console.log("idx:" + idx + ", val:" + val); // idx:0, val:3 idx:1, val:5 idx:2, val:7
}


/** Promise (콜백 지옥 방지) */
function delay(ms) {
    return new Promise((resolve, reject) => {
        try{
            setTimeout(resolve, ms);
        } catch (err) {
            reject(err);
        }
    });
}

delay(3000)
    .then(() => console.log('3초 뒤 실행'));

/** export, import (node.js는 안됨) */
export let admin = {
    name: "John"
};

import {admin} from './admin.js';
admin.name = "Pete";

import {admin} from './admin.js';

console.log(admin.name); // Pete