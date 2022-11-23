import { useState } from 'preact/hooks';

export function Counter() {
  const [counter, setCounter] = useState(1);

  return <div onClick={() => setCounter((prev) => prev + 1)}>My count: {counter}</div>;
}
