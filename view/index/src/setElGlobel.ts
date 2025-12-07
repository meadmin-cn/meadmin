import { provideGlobalConfig } from 'element-plus';
export default defineComponent({
  setup() {
    provideGlobalConfig(
      {
      },
      undefined,
      true,
    );
  },
  render: () => '',
});
