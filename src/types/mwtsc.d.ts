//对于无需校验的用.d.ts命名。正常的类型扩展或类型声明，使用.ts声明。因为项目的"skipLibCheck": true,会调过.d.ts的类型检查
declare module 'mwtsc' {
  type Run = () => {
    restart: () => void;
    exit: () => void;
    onExit: () => void;
  };
  export const run: Run;
}
