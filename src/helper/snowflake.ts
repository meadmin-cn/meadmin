export class CustomSnowflake {
  private workerId: number; // 机器ID，10位机器码，最大值1023
  private sequence = 0; // 序列号
  private lastTimestamp = -1; // 上次生成ID的时间戳
  private epoch; // 初始时间戳，可自定义
  constructor(workerId, epoch = 1609459200000) {
    this.workerId = workerId; // 机器ID
    this.epoch = epoch; // 初始时间戳，可自定义
  }

  // 生成下一个ID的方法
  nextId() {
    let timestamp = Date.now();

    // 如果当前时间小于上次生成ID的时间，抛出异常
    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards, refusing to generate id');
    }

    // 如果当前时间与上次生成ID的时间相同，则递增序列号
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & 4095; // 12位序列号

      // 如果序列号达到最大值，等待下一毫秒
      if (this.sequence === 0) {
        timestamp = this.waitNextMillis(timestamp);
      }
    } else {
      this.sequence = 0; // 重置序列号
    }

    this.lastTimestamp = timestamp; // 更新上次生成ID的时间戳

    // 生成ID，包括时间戳、机器ID和序列号
    const id = ((BigInt(timestamp - this.epoch) << 22n) | (BigInt(this.workerId) << 10n) | BigInt(this.sequence)).toString(10);
    return id;
  }

  // 等待下一毫秒的方法
  waitNextMillis(timestamp: number) {
    while (timestamp <= this.lastTimestamp) {
      timestamp = Date.now();
    }
    return timestamp;
  }
}
const customSnowflake = new CustomSnowflake(0); // 设置机器ID为0
export const uuid = () => {
  return customSnowflake.nextId();
};
