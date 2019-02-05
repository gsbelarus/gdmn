import { Semaphore } from 'gdmn-internals';

interface IMutexes {
  [name: string]: Semaphore
}

const mutexes: IMutexes = { }

export function getMutex(name: string) {
  let mutex = mutexes[name];

  if (mutex) {
    return mutex;
  } else {
    mutex = new Semaphore();
    mutexes[name] = mutex;
    return mutex;
  }
}

export function disposeMutex(name: string) {
  delete mutexes[name];
}
