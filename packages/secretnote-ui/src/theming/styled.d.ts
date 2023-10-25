import 'styled-components';

type Typography = {
  fontFamily: string;
};

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    colors: {
      text: string;
      link: string;
      strong: string;
      emphasis: string;
      border: string;
      highlight: string;
      container: {
        text: string;
        background: string;
        border: string;
      };
    };
    typography: {
      text: Typography;
      code: Typography;
      math: Typography;
    };
  }
}
