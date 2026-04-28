import { createElement, forwardRef } from "react";

const Image = forwardRef(function Image(
  {
    src,
    alt,
    fill = false,
    priority = false,
    quality,
    placeholder,
    blurDataURL,
    unoptimized,
    style,
    width,
    height,
    loading,
    ...props
  },
  ref,
) {
  const resolvedSrc = typeof src === "string" ? src : src?.src;
  const fillStyle = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }
    : {};

  return createElement("img", {
    ref,
    src: resolvedSrc,
    alt,
    width: fill ? undefined : width,
    height: fill ? undefined : height,
    loading: priority ? "eager" : loading,
    style: { ...fillStyle, ...style },
    ...props,
  });
});

Image.displayName = "Image";

export default Image;
