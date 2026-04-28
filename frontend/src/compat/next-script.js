import { createElement } from "react";

export default function Script({ strategy, ...props }) {
  return createElement("script", props);
}
