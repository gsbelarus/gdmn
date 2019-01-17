import {Semaphore} from "gdmn-internals";

describe("semaphore", () => {

  it("async/await never release", async () => {
    const lock = new Semaphore();

    expect(lock.permits).toEqual(1);
    await lock.acquire();
    expect(lock.permits).toEqual(0);

    let promiseDone = false;
    lock.acquire().then(() => promiseDone = true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(promiseDone).toBeFalsy();
  });

  it("async/await multiple", async () => {
    const lock = new Semaphore();

    for (let i = 0; i < 2; i++) {
      expect(lock.permits).toEqual(1);
      await lock.acquire();
      expect(lock.permits).toEqual(0);
      lock.release();
      expect(lock.permits).toEqual(1);
    }
  });

  it("multiple", (done) => {
    const lock = new Semaphore();

    lock.acquire().then(() => {
      expect(lock.permits).toEqual(0);
      lock.release();
      expect(lock.permits).toEqual(1);

      lock.acquire().then(() => {
        expect(lock.permits).toEqual(0);
        lock.release();
        expect(lock.permits).toEqual(1);

        done();
      });
    });
  });

  it("nested", done => {
    const lock = new Semaphore();

    lock.acquire().then(() => {
      expect(lock.permits).toEqual(0);

      let promiseDone = false;
      lock.acquire().then(() => {
        expect(lock.permits).toEqual(0);

        promiseDone = true;
        lock.release();

        expect(lock.permits).toEqual(1);
      });

      expect(lock.permits).toEqual(0);
      expect(promiseDone).toBeFalsy();

      setImmediate(() => {
        expect(lock.permits).toEqual(0);
        expect(promiseDone).toBeFalsy();

        lock.release();

        expect(lock.permits).toEqual(0);
        expect(promiseDone).toBeFalsy();

        setImmediate(() => {
          expect(lock.permits).toEqual(1);
          expect(promiseDone).toBeTruthy();

          done();
        });
      });
    });
  });

  test("async", done => {
    const lock = new Semaphore();

    const res: number[] = [];

    lock.acquire().then(() => {
      res.push(1);
      setImmediate(() => {
        res.push(2);
        lock.release();
        expect(lock.permits).toEqual(0);

        lock.acquire().then(() => {
          res.push(14);
          lock.release();
          res.push(15);
        });
        res.push(3);
      });
    });

    res.push(4);

    lock.acquire().then(() => {
      res.push(5);
      lock.release();
      res.push(6);
    });

    lock.acquire().then(() => {
      res.push(7);
      lock.release();
      res.push(8);
    });

    setImmediate(() => {
      res.push(9);
      expect(lock.permits).toEqual(0);
      lock.acquire().then(() => {
        res.push(10);
        lock.release();
        res.push(11);
      });
      res.push(12);
    });

    res.push(13);
    expect(lock.permits).toEqual(0);

    setImmediate(() => {
      setImmediate(() => {
        expect(lock.permits).toEqual(1);
        expect(res).toEqual([4, 13, 1, 9, 12, 2, 3, 5, 6, 7, 8, 10, 11, 14, 15]);
        done();
      });
    });
  });
});