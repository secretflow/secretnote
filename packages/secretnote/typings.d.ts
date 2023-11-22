import 'umi/typings';

declare global {
  declare module '*.csv' {
    const src: string;
    export default src;
  }

  declare module '*.ipynb' {
    const src: string;
    export default src;
  }
}
