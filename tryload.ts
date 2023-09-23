// NOPE
// try {
//   eval(`
// console.log('HI');
// setTimeout(() => {
//   throw new Error('OHHH');
// }, 2000);
// `);
// } catch (err) {
//   console.log('CATCHED', err);
// }

// WORKS
// async function doSpawn() {
//   const command = new Deno.Command(Deno.execPath(), {
//     args: [
//       'eval',
//       "console.log('hello'); setTimeout(() => {throw new Error('OPS');}, 2000);",
//     ],
//   });
//   const { code, stdout, stderr } = await command.output();
//   console.log('code', code);
//   console.log('stdout', stdout);
//   console.log('stderr', stderr);
// }

const worker = new Worker(new URL('./tryworker.ts', import.meta.url).href, {
  type: 'module',
});

globalThis.addEventListener('unhandledrejection', (e) => {
  if (String(e.reason).includes('child worker')) {
    e.preventDefault();
  }
});

worker.addEventListener('error', () => {
  console.log('ASD');
});

Deno.serve((_req) => new Response('Hello, world'));
