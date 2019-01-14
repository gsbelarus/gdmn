export type MutexReleaseFunc = () => void;
export type MutexCallbackFunc = (release: MutexReleaseFunc) => void;

export class Mutex {
  private _lockCount = 0;
  private _pending: MutexCallbackFunc[] = [];

  private _release: MutexReleaseFunc = () => {
    const pending = this._pending.shift();
    if (pending) {
      setTimeout(
        () => {
          this._lockCount -= 1;
          pending(this._release);
        }, 0);
    } else {
      this._lockCount -= 1;
    }
  }

  public isLocked() {
    return !!this._lockCount;
  }

  public acquire(callback: MutexCallbackFunc) {
    this._lockCount += 1;
    if (this._lockCount === 1) {
      setTimeout(() => callback(this._release), 0);
    } else {
      this._pending.push(callback);
    }
  }
}