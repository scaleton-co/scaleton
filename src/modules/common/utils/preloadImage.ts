export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.src = src;
    image.onload = () => resolve();
    image.onerror = () => reject();
  });
}
