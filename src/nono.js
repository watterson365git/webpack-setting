import 'core-js/modules/es.object.to-string';
import 'core-js/modules/es.promise';
import 'core-js/modules/web.timers';

console.log('nonononononno');
const promise = new Promise(((resolve, reject) => {
  setTimeout(() => {
    console.log('hello world');
  }, 3000);
})).then(console.log('success'));
