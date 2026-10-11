// 监听元素大小变化的指令；SSR 环境没有 ResizeObserver，必须延迟到浏览器挂载时创建。
const map = new WeakMap<Element, (size: { width: number; height: number }) => void>();
let observer: ResizeObserver | undefined;
const getObserver = () => {
  if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return undefined;
  if (observer) return observer;
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const handler = map.get(entry.target);
      if (!handler) continue;
      const box = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
      handler({ width: box?.inlineSize ?? entry.contentRect.width, height: box?.blockSize ?? entry.contentRect.height });
    }
  });
  return observer;
};

export const Resize = {
  mounted(el: Element, binding: { value: (size: { width: number; height: number }) => void }) {
    map.set(el, binding.value);
    getObserver()?.observe(el);
  },
  unmounted(el: Element) {
    observer?.unobserve(el);
    map.delete(el);
  },
};

export default Resize;
