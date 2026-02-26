<template>
  <me-dialog
    v-model="show"
    :title="t(id ? '编辑' : '新增')"
    :close-on-click-modal="false"
    @closed="emit('closed')"
  >
    <el-form
      ref="formEl"
      v-loading="loading"
      :model="info"
      :rules="rules"
      class="add"
      label-width="auto"
    >
      <el-form-item :label="t('父级id')" prop="parentId">
        <el-input v-model="info.parentId"></el-input>
      </el-form-item>
      <el-form-item :label="t('名称')" prop="title">
        <el-input v-model="info.title"></el-input>
      </el-form-item>
      <el-form-item :label="t('图标(200*200)')" prop="icon">
        <me-upload
          :limit="1"
          :model-value="info.icon ? [info.icon] : []"
          @update:model-value="
            (files) => (info.icon = files.length ? files[0] : null)
          "
        ></me-upload>
      </el-form-item>
      <el-form-item :label="t('类型')" prop="type">
        <el-select v-model="info.type">
          <el-option
            v-for="val in dict.type"
            :key="val.value"
            :value="val.value"
            :label="val.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('状态')" prop="status">
        <el-select v-model="info.status" :value-on-clear="null" clearable>
          <el-option
            v-for="val in dict.status"
            :key="val.value"
            :value="val.value"
            :label="val.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('排序(降序)')" prop="orderNum">
        <el-input-number
          v-model="info.orderNum"
          :value-on-clear="null"
        ></el-input-number>
      </el-form-item>
      <el-form-item :label="t('内容类型')" prop="constentType">
        <el-select v-model="info.constentType" :value-on-clear="null" clearable>
          <el-option
            v-for="val in dict.constentType"
            :key="val.value"
            :value="val.value"
            :label="val.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('内容')" prop="mdContent">
        <el-input v-model="info.mdContent"></el-input>
      </el-form-item>
      <el-form-item :label="t('外链地址')" prop="link">
        <el-input v-model="info.link"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <me-button @click="() => (show = false)">{{ t("取消") }}</me-button>
      <me-button type="primary" @click="submit">{{ t("提交") }}</me-button>
    </template>
  </me-dialog>
</template>

<script setup lang="ts" name="AddOrUpAonDoc">
import {
  AonDoc,
  addAonDocApi,
  aonDocInfoApi,
  updateAonDocApi,
} from "@/addons/doc/api/aonDoc";
import { useLocalesI18n } from "@/locales/i18n";
import { resetObj } from "@/utils/helper";
import { FormInstance, FormRules } from "element-plus";
import { getDict } from "../dict.js";

//接口需要现在setup顶层初始化（如果是异步setup需要在异步调用之前初始化），否则会有unMounted，非法调用警告，因为vueRequest使用了unMounted
const { runAsync: updateRunAsync } = updateAonDocApi();
const { runAsync: addRunAsync } = addAonDocApi();
const { runAsync: infoRunAsync } = aonDocInfoApi();

let { t, loadRes } = useLocalesI18n({}, [
  (locale: string) => import(`../lang/${locale}.json`),
  "aonDoc",
]);
await loadRes;
const dict = getDict(t);
const show = defineModel<boolean>();
const props = defineProps<{
  id?: string;
}>();
const emit = defineEmits<{
  (e: "success"): void;
  (e: "closed"): void;
}>();

const info = reactive(new AonDoc());
const loading = ref(false);
watch(
  () => props.id,
  async (id?: string) => {
    if (id) {
      loading.value = true;
      resetObj(info, await infoRunAsync(id));
      loading.value = false;
    }
  },
  { immediate: true }
);
const rules: FormRules = {
  parentId: [
    {
      type: "string",
      max: 100,
      message: t("{label} 长度必须小于等于 {max}", {
        label: t("父级id"),
        max: 100,
      }),
      trigger: "blur",
    },
  ],
  title: [
    {
      required: true,
      message: t("{label} 必须填写", { label: t("名称") }),
      trigger: "blur",
    },
    {
      type: "string",
      max: 100,
      message: t("{label} 长度必须小于等于 {max}", {
        label: t("名称"),
        max: 100,
      }),
      trigger: "blur",
    },
  ],
  type: [
    {
      required: true,
      message: t("{label} 必须填写", { label: t("类型") }),
      trigger: "blur",
    },
  ],
  orderNum: [
    {
      type: "number",
      max: 9999,
      message: t("{label} 必须小于等于 {max}", {
        label: t("排序(降序)"),
        max: 9999,
      }),
      trigger: "blur",
    },
  ],
};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  if (props.id) {
    await updateRunAsync(props.id, info);
  } else {
    await addRunAsync(info);
  }
  show.value = false;
  emit("success");
};
</script>
