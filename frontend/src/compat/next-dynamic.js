import { Suspense, createElement, forwardRef, lazy } from "react";

function normalizeModule(mod) {
  if (typeof mod === "object" && mod !== null && "default" in mod) {
    return mod;
  }

  return { default: mod };
}

export default function dynamic(loader, options = {}) {
  const LazyComponent = lazy(async () => normalizeModule(await loader()));
  const LoadingComponent = options.loading;

  const DynamicComponent = forwardRef(function DynamicComponent(props, ref) {
    return createElement(
      Suspense,
      {
        fallback: LoadingComponent ? createElement(LoadingComponent) : null,
      },
      createElement(LazyComponent, { ref, ...props }),
    );
  });

  DynamicComponent.displayName = "DynamicComponent";

  return DynamicComponent;
}
