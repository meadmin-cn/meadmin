declare module 'mwtsc' {
  type Run = () => {
    restart: () => void;
    exit: () => void;
    onExit: () => void;
  };
  export const run: Run;
}
