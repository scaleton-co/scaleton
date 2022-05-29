export function timeout(ms: number) {
  return new Promise((_, reject) => setTimeout(
    () => reject(new Error(`Timeout of ${ms} milliseconds exceeded.`)),
    ms,
  ));
}
