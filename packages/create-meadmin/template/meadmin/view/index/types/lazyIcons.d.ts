declare module 'virtual:me-element-icons' {
  const loaders: Record<keyof typeof import('@element-plus/icons-vue'), () => Promise<import('vue').Component>>;
  export default loaders;
}
