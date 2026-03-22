<template>
  <page>
    <div class="aon-doc-config">
      <el-form ref="formEl" v-loading="loading" :model="info" :rules="rules" label-width="auto">
        <el-form-item :label="t('图标')" prop="icon">
          <me-upload :limit="1" :model-value="info.icon ? [info.icon] : []"
            @update:model-value="(files) => (info.icon = files.length ? files[0] : null)"></me-upload>
        </el-form-item>
        <el-form-item :label="t('版本')" prop="version">
          <me-button @click="addVsersion"> {{ t('添加') }}</me-button>
        </el-form-item>
        <el-form-item v-for="(item, index) in info.version" :key="index" label=" ">
          <el-form :inline="true">
            <el-form-item :label="t('标题')" props="title">
              <el-input v-model="item.title"></el-input>
            </el-form-item>
            <el-form-item :label="t('标识')" props="code" readonly>
              <el-input v-model="item.code"></el-input>
            </el-form-item>
            <el-form-item :label="t('状态')" props="status">
              <el-switch v-model="item.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <me-button danger @click="removeVersion(index)"> {{ t('删除') }}</me-button>
          </el-form>
        </el-form-item>
        <el-form-item :label="t('外链')" prop="links">
          <me-button @click="addLinks"> {{ t('添加') }}</me-button>
        </el-form-item>
        <el-form-item v-for="(item, index) in info.links" :key="index" label=" ">
          <el-form :inline="true">
            <el-form-item :label="t('标题')" props="title">
              <el-input v-model="item.title"></el-input>
            </el-form-item>
            <el-form-item :label="t('链接')" props="url" readonly>
              <el-input v-model="item.url"></el-input>
            </el-form-item>
            <el-form-item :label="t('图标')" props="icon">
              <me-upload :class="{ 'up-over': Boolean(item.icon) }" :limit="1"
                :model-value="item.icon ? [item.icon] : []" list-type="picture-card"
                @update:model-value="(files) => (item.icon = files.length ? files[0] : null)">
                <mel-icon-plus></mel-icon-plus>
              </me-upload>
            </el-form-item>
            <el-form-item label=" "><me-button danger @click="removeLinks(index)"> {{ t('删除')
                }}</me-button></el-form-item>
          </el-form>
        </el-form-item>
      </el-form>
      <div>
        <me-button v-if="$permission('aon_doc_config_edit')" type="primary" @click="submit">{{ t('更新') }}</me-button>
      </div>
    </div>
  </page>
</template>

<script setup lang="ts" name="AddOrUpAonDocConfig">
import { AonConfigVersion, AonDocConfig, aonDocConfigInfoApi, AonDocConfiglinks, updateAonDocConfigApi } from '@/addons/doc/api/config';
import { useLocalesI18n } from '@/locales/i18n';
import { resetObj } from '@/utils/helper';
import { FormInstance, FormRules } from 'element-plus';

//接口需要现在setup顶层初始化（如果是异步setup需要在异步调用之前初始化），否则会有unMounted，非法调用警告，因为vueRequest使用了unMounted
const { runAsync: updateRunAsync, loading } = updateAonDocConfigApi();
const { runAsync: infoRunAsync } = aonDocConfigInfoApi();
let { t, loadRes } = useLocalesI18n({}, [(locale: string) => import(`./lang/${locale}.json`), 'aonDocConfig']);
await loadRes;
const info = reactive(new AonDocConfig());
resetObj(info, await infoRunAsync());
const rules: FormRules = {};
const formEl = ref<FormInstance>();
const submit = async () => {
  try {
    await formEl.value!.validate();
  } catch (invalidFields) {
    return formEl.value!.scrollToField(Object.keys(invalidFields!)[0]);
  }
  await updateRunAsync(info);
};
const addVsersion = () => {
  info.version.push(new AonConfigVersion());
}
const removeVersion = (index: number) => {
  info.version.splice(index, 1);
}
const addLinks = () => {
  info.links.push(new AonDocConfiglinks());

}
const removeLinks = (index: number) => {
  info.links.splice(index, 1);
}
</script>
<style lang="scss" scoped>
.aon-doc-config {
  :deep(.el-form-item) {
    align-items: center;
  }

  :deep(.me-upload) {
    height: 50px;
  }

  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      height: 50px;
      width: 50px;
      margin-bottom: 0;

      .el-icon--close-tip {
        display: none;
      }
    }

    .el-upload {
      height: 50px;
      width: 50px
    }

    .el-upload-list__item-actions {
      font-size: 15px;
    }
  }

  .up-over {
    :deep(.el-upload) {
      display: none;
    }
  }
}
</style>
