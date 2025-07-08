/**
 * Simple throttle helper
 * @param fn - The function to throttle
 * @param interval - The interval in milliseconds
 * @returns A throttled function
 */
export function throttle(fn: (...args: any[]) => void, interval = 100) {          // interval in ms
    let last = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - last >= interval) {
        last = now;
        fn(...args);
      }
    };
  }