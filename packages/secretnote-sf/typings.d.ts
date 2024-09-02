declare module '*.less';
declare module '*.svg' {
  declare const Component: React.FC;
  export = Component;
}
