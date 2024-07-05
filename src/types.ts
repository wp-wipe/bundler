export type BuildOptions = {
  watch: boolean;
  minimify: boolean;
  outFolder: string;
  adminFolder: string;
  publicFolder: string;
  esm: boolean,
  cjs: boolean,
  iife: boolean,
  map: boolean,
  dts: boolean,
};
