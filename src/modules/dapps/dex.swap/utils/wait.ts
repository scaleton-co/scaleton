export async function wait<T>(
  callback: () => Promise<T | null>,
  interval: number,
): Promise<T> {
  return new Promise(resolve => {
    const intervalTimer = setInterval(
      async () => {
        const result = await callback();
        if (result !== null) {
          clearInterval(intervalTimer);
          resolve(result);
        }
      },
      interval,
    );
  });
}
