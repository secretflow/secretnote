interface ShapeBuilder<S, N extends keyof S> {
  attr: <K extends keyof S[N]>(key: K, value: S[N][K]) => ShapeBuilder<S, N>;
  align: (value: string) => ShapeBuilder<S, N>;
  margin: (side: string, value: number) => ShapeBuilder<S, N>;
  floating: (enabled: boolean) => ShapeBuilder<S, N>;
  sibling: () => Drawer<S>;
  container: () => Drawer<S>;
}

interface Drawer<S> {
  shape: <N extends keyof S>(name: N) => ShapeBuilder<S, N>;
}

interface Shapes {
  rect: { width: number; height: number };
}

export function draw(): Drawer<Shapes> {
  throw new Error('Not implemented');
  // const drawer: Drawer<Shapes> = {
  //   shape: (name) => {
  //     const builder: ShapeBuilder<Shapes, typeof name> = {
  //       attr: (key, value) => {
  //         return builder;
  //       },
  //       sibling: () => {
  //         return drawer;
  //       },
  //       container: () => {
  //         return drawer;
  //       },
  //     };
  //     return builder;
  //   },
  // };
  // return drawer;
}
