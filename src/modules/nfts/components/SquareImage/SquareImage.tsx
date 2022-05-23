import './SquareImage.scss';

interface SquareImageProps {
  alt: string;
  src: string;
}

export function SquareImage({ alt, src }: SquareImageProps) {
  return (
    <div className="square-image-container">
      <img alt={alt} src={src} />
    </div>
  );
}
