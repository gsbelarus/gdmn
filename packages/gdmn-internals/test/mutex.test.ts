import { Mutex } from "gdmn-internals";

describe("mutex", () => {
  test("sync", () => {
    const mutex = new Mutex();

    expect(mutex.isLocked()).toBeFalsy();
    mutex.acquire( release => {
      /* do some work */
      release();
    });
    expect(mutex.isLocked()).toBeFalsy();
    mutex.acquire( release => {
      /* do some work */
      /* and never release */
    });
    expect(mutex.isLocked()).toBeTruthy();
  });

  test("async", done => {
    const mutex = new Mutex();
    const res: number[] = [];

    mutex.acquire( release => {
      res.push(1);
      setTimeout( () => {
        res.push(2);
        release();
        res.push(3);
      }, 100);
    });

    res.push(4);

    mutex.acquire( release => {
      res.push(5);
      release();
      res.push(6);
    });

    mutex.acquire( release => {
      res.push(7);
      release();
      res.push(8);
    });

    setTimeout( () => {
      res.push(9);
      expect(mutex.isLocked()).toBeTruthy();
      mutex.acquire( release => {
        res.push(10);
        release();
        res.push(11);
      });
      res.push(12);
    }, 50);

    res.push(13);
    expect(mutex.isLocked()).toBeTruthy();

    setTimeout( () => {
      expect(mutex.isLocked()).toBeFalsy();
      expect(res).toEqual([1, 4, 13, 9, 12, 2, 3, 5, 6, 7, 8, 10, 11]);
      done();
    }, 150);
  });
});