type LocalFontSource =
  | string
  | {
      path: string;
      weight?: string;
      style?: string;
    };

type LocalFontOptions = {
  src: LocalFontSource | LocalFontSource[];
  variable?: string;
};

export default function localFont(options: LocalFontOptions) {
  return {
    className: '',
    style: {},
    variable: options.variable || '',
  };
}
