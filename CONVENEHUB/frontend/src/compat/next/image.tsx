import { CSSProperties, ImgHTMLAttributes, forwardRef } from 'react';

type ImageSource = string | { src: string };

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: ImageSource;
  alt: string;
  fill?: boolean;
  unoptimized?: boolean;
  priority?: boolean;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { src, alt, fill, style, ...rest },
  ref
) {
  const resolvedSrc = typeof src === 'string' ? src : src.src;
  const mergedStyle: CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: (style as CSSProperties | undefined)?.objectFit ?? 'cover',
        ...style,
      }
    : { ...style };

  return <img ref={ref} src={resolvedSrc} alt={alt} style={mergedStyle} {...rest} />;
});

export default Image;
