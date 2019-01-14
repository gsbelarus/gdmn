import { Mutex } from 'gdmn-internals';

interface IMutexes {
  [name: string]: Mutex
}

const mutexes: IMutexes = { }

export function getMutex(name: string) {
  let mutex = mutexes[name];

  if (mutex) {
    return mutex;
  } else {
    mutex = new Mutex();
    mutexes[name] = mutex;
    return mutex;
  }
}

export function disposeMutex(name: string) {
  delete mutexes[name];
}