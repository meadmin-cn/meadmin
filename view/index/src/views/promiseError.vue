<template>
  <div class="promise-error"></div>
</template>

<script setup lang="ts" name="PromiseError">
import { useUserStore } from '@/store';
const userStore = useUserStore();
const router = useRouter();
const props = defineProps<{ msg: string }>();
onMounted(()=>{
ElMessageBox.confirm(props.msg, '无权限访问', {
  confirmButtonText: userStore.token ? '重新登陆' : '去 登 陆',
  cancelButtonText: '返回上一页',
  type: 'warning',
  showClose:false,
  closeOnClickModal:false,
  closeOnPressEscape:false,
  closeOnHashChange:false,
}).then(async () => {
    await userStore.logOut();
}).catch(() => {
    router.back();
});
})

</script>
<style lang="scss" scoped>
.promise-error {
}
</style>
