// import './index.css';
// import './nono';
import $ from "jquery"
import(/*webpackChunkName:"index.css"*/"./index.css")
import(/* webpackChunkName: "nono" */ "./nono")

// if('serviceWorker'in navigator){
//     window.addEventListener("load",()=>{
//         navigator.serviceWorker.register("/service-worker.js")
//             .then(()=>{
//                 console.log("注册成功");
//             })
//             .catch(()=>{
//                 console.log("注册失败");
//             })
//     })
// }
console.log($);
console.log('hello !!!!!!!!!');
