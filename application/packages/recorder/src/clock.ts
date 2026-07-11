/** Monotonic clock shared by every hook in a recording session, so events across
 * state/DOM/network sources land on one consistent timeline. */
export class RecordingClock {
  private readonly now: () => number;
  private readonly startedAt: number;

  constructor(now: () => number = () => performance.now()) {
    this.now = now;
    this.startedAt = this.now();
  }

  elapsed(): number {
    return this.now() - this.startedAt;
  }
}
