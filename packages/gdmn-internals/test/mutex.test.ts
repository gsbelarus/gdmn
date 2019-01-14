import { Mutex } from "gdmn-internals";

describe("mutex", () => {
  test("never release", done => {
    const mutex = new Mutex();

    expect(mutex.isLocked()).toBeFalsy();
    mutex.acquire( release => {
      /* do some work */
      release();
    });
    expect(mutex.isLocked()).toBeTruthy();

    setTimeout( () => expect(mutex.isLocked()).toBeFalsy(), 200 );

    setTimeout( () => {
      mutex.acquire( release => {
        /* do some work */
        /* and never release */
      });
      expect(mutex.isLocked()).toBeTruthy();
    }, 800);

    setTimeout( () => {
      expect(mutex.isLocked()).toBeTruthy();
      done();
    }, 1200);
  });

  test("sync multiple", done => {
    const mutex = new Mutex();

    expect(mutex.isLocked()).toBeFalsy();
    mutex.acquire( release => {
      /* do some work */
      release();
    });
    expect(mutex.isLocked()).toBeTruthy();
    mutex.acquire( release => {
      /* do some work */
      release();
    });
    expect(mutex.isLocked()).toBeTruthy();

    setTimeout(
      () => {
        expect(mutex.isLocked()).toBeFalsy();
        done();
      }, 400
    )
  });

  test("async nested", done => {
    const mutex = new Mutex();

    expect(mutex.isLocked()).toBeFalsy();
    mutex.acquire( release => {
      release();

      expect(mutex.isLocked()).toBeTruthy();

      setTimeout(
        () => {
          expect(mutex.isLocked()).toBeFalsy();
          mutex.acquire( release => {
            mutex.acquire( r => {
              r();
            });
            release();
          })

        }, 400
      )
    });

    expect(mutex.isLocked()).toBeTruthy();
    mutex.acquire( release => {
      /* do some work */
      release();
    });
    expect(mutex.isLocked()).toBeTruthy();

    setTimeout(
      () => {
        expect(mutex.isLocked()).toBeFalsy();
        done();
      },
    800)
  });

  test("async", done => {
    const mutex = new Mutex();
    const res: number[] = [];

    mutex.acquire( release => {
      res.push(1);
      setTimeout( () => {
        res.push(2);
        release();
        expect(mutex.isLocked()).toBeTruthy();
        mutex.acquire( r => {
          res.push(14);
          r();
          res.push(15);
        });
        res.push(3);
      }, 800);
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
    }, 400);

    res.push(13);
    expect(mutex.isLocked()).toBeTruthy();

    setTimeout( () => {
      expect(mutex.isLocked()).toBeFalsy();
      expect(res).toEqual([4, 13, 1, 9, 12, 2, 3, 5, 6, 7, 8, 10, 11, 14, 15]);
      done();
    }, 1600);
  });
});