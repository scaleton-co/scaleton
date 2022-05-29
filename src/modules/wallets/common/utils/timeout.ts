export function timeout(ms: number, message: string) {
  return new Promise((_, reject) => setTimeout(
    () => reject(new Error(message)),
    ms,
  ));
}
