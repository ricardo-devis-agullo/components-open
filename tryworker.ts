console.log('WORKER');
// throw new Error('OHNOES');
setTimeout(() => {
  Promise.reject('REJECT');
}, 100);
