declare module '*.less';
declare module '*.md';
declare module '*.svg' {
  declare const Component: React.FC;
  export = Component;
}
