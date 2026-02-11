import { ElImageViewer } from 'element-plus';
import { createVNode, render } from 'vue';
//函数组件只能以服务的方式调用
export function createImageViewer(props: ComponentProps<typeof ElImageViewer>) {
  const vnode = createVNode(
    ElImageViewer,
    Object.assign(
      {
        // 解决 element plus 2.8.0 及以上版本，不能关闭 image-viewer 的问题
        teleported: true,
        onClose: function () {
          if (!import.meta.env.SSR) {
            render(null, document.body);
          }
          if (typeof props.onClose === 'function') {
            props.onClose.call(this);
          }
        },
      },
      props,
    ),
  );
  if (!import.meta.env.SSR) {
    render(vnode, document.body);
  }
  return vnode;
}
