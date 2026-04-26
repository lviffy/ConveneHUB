import React, { useEffect } from 'react';

type ScriptProps = React.ScriptHTMLAttributes<HTMLScriptElement> & {
  strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload';
};

export default function Script({ strategy: _strategy, ...props }: ScriptProps) {
  useEffect(() => {
    if (!props.src) {
      return;
    }

    const script = document.createElement('script');
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'children' || key === 'dangerouslySetInnerHTML' || value == null) {
        return;
      }
      script.setAttribute(key, String(value));
    });

    if (props.dangerouslySetInnerHTML?.__html) {
      script.innerHTML = props.dangerouslySetInnerHTML.__html;
    }

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [props]);

  return null;
}
