import { PropType, Ref, SuspenseProps, Transition, TransitionProps, VNode } from 'vue';
import { MeKeepAliveProps, default as MeKeepAlive } from './meKeepAlive';
import { useLoadMessages } from '@/locales/i18n';
import { done } from '@/utils/nProgress';
import { localeConfig } from '@/config';
import { closeLoading, loadingObject } from '@/utils/loading';
import {Suspense} from 'vue';
export default defineComponent({
  name: 'MeComponent',
  props: {
    is: {
      type: [String, Object],
    },
    keepAlive: Object as PropType<MeKeepAliveProps>,
    componentKey: [Number, String, Symbol],
    doneProgress: Boolean,
    closeLoading: String as PropType<keyof typeof loadingObject>,
    transition: Object as PropType<TransitionProps>,
    suspense: Object as  PropType<SuspenseProps>
  },
  setup(props, { attrs, slots }) {
    const loadMessages = useLoadMessages();
    const componentIs: Ref<any> = ref(undefined);
    const key = ref(props.componentKey);
    const _attrs = ref(attrs);
    watch(
      () => props.is,
      async (is) => {
        if (is) {
          localeConfig.loadMessageConfig.componentLoad && (await Promise.allSettled(loadMessages(is as any, false))); // 自动加载语言包
          componentIs.value = is;
          key.value = props.componentKey;
          _attrs.value = attrs;
          props.doneProgress && done();
          props.closeLoading && closeLoading(false, 1, props.closeLoading);
        }
      },
      { immediate: true },
    );

    return () => {
      let componentFn:()=>VNode;
      componentFn = ()=>h(componentIs.value || 'div', {
          key: key.value,
          ..._attrs.value,
        });
      if(props.suspense){
        componentFn = ()=>h(Suspense, props.suspense, {
          default: componentFn,
          fallback:slots.fallback
        });
      }
      if (props.keepAlive) {
        componentFn = ()=>h(MeKeepAlive, props.keepAlive, [componentFn()]);
      }
      if (props.transition) {
        componentFn = ()=>h(Transition, props.transition, { default: componentFn });
      }
      return componentFn();
    };
  },
});
