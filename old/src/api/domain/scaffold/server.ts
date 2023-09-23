const delay = (ms = 0) => new Promise((res) => setTimeout(res, ms));

export async function data() {
  await delay(10);
  return { hi: 2 };
}
