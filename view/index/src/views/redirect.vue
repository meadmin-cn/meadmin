<template>
  <span></span>
</template>
<script setup lang="ts" name="Redirect">
const route = useRoute();
const router = useRouter();
const fullPath = route.params.path as string;
onMounted(() => router.replace(fullPath));
</script>
