/**
 * Simple throttle helper
 * @param fn - The function to throttle
 * @param interval - The interval in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends unknown[]>(fn: (...args: T) => void, interval = 100) {
    // interval in ms
    let last = 0;
    return (...args: T) => {
        const now = Date.now();
        if (now - last >= interval) {
            last = now;
            fn(...args);
        }
    };
}
