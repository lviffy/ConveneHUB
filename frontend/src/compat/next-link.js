import { createElement, forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";

const Link = forwardRef(function Link(
  { href, children, prefetch, scroll, ...props },
  ref,
) {
  return createElement(RouterLink, { ref, to: href, ...props }, children);
});

Link.displayName = "Link";

export default Link;
