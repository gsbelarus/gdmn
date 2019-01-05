export type MutexReleaseFunc = () => void;
export type MutexCallbackFunc = (release: MutexReleaseFunc) => void;

export class Mutex {
  private _lockCount = 0;
  private _pending: MutexCallbackFunc[] = [];

  private _release: MutexReleaseFunc = () => {
    this._lockCount -= 1;
    const pending = this._pending.shift();
    if (pending) {
      setTimeout(() => pending(this._release), 0);
    }
  }

  public isLocked() {
    return !!this._lockCount;
  }

  public acquire(callback: MutexCallbackFunc) {
    this._lockCount += 1;
    if (this._lockCount === 1) {
      callback(this._release);
    } else {
      this._pending.push(callback);
    }
  }
}