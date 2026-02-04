<template>
  <div class="index">
    <div class="content">
      <login class="content-body" :class="{ hidden: show === 'register' }" @go="(id) => (show = id)"></login>
      <register class="content-body" @go="(id) => (show = id)"></register>
    </div>
  </div>
</template>

<script setup lang="ts" name="LoginIndex">
import Login from './components/login.vue';
import Register from './components/register.vue';
const { type = 'login' } = defineProps<{ type: 'login' | 'register' }>();
const show = ref('login' as 'login' | 'register');
watchEffect(() => {
  show.value = type;
});
</script>
<style lang="scss" scoped>
.index {
  padding-top: 15vh;
  .content {
    width: 800px;
    height: 550px;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
    margin: auto;
    overflow: hidden;
    display: flex;
    .content-body {
      background-image: linear-gradient(120deg, #3498db, #8e44ad);
      transition: margin-left 600ms ease-in-out;
      flex-shrink: 0;
      width: 100%;
      height: 100%;
      display: flex;
      :deep(.left),
      :deep(.right) {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        .button {
          display: flex;
          align-items: center;
          margin: 0 auto;
          margin-top: 25px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          padding: 12px 45px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: transform 80ms ease-in;
          cursor: pointer;
        }
        button:hover {
          transform: scale(1.05);
        }
        button:focus {
          outline: none;
        }
        .form {
          width: 85%;
          .title {
            text-align: center;
            font-size: 32px;
            font-weight: bolder;
            margin-bottom: 30px;
          }
          .submit {
            width: 200px;
            background: linear-gradient(120deg, #3498db, #8e44ad);
            color: #fff;
          }

          .el-input__wrapper {
            box-shadow: unset;
            border-radius: 0;
            position: relative;
            input {
              border-bottom: 1px solid #dcdfe6;
              padding: 5px;
            }
            &:after {
              content: '';
              width: 0;
              position: absolute;
              left: 15px;
              right: 15px;
              bottom: 1px;
              height: 1px;
              transition: width 500ms ease-in;
            }
            &:hover::after {
              width: calc(100% - 30px);
              background-image: linear-gradient(90deg, #3498db, #8e44ad);
            }
          }
          .captcha-input {
            input {
              padding-right: 180px;
            }
            .el-input-group__append {
              position: absolute;
              right: 11px;
              bottom: 2px;
              box-shadow: none;
              background: none;
              padding: 0;

              .captcha-img {
                display: block;
                width: 150px;
                height: calc(var(--el-component-size) - 2px);
                cursor: pointer;
              }
            }
          }
        }
        .explanation {
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          .title {
            font-size: 32px;
            font-weight: bolder;
            margin-bottom: 15px;
            text-align: center;
          }
          .go {
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
            padding: 20px 30px;
          }
        }
      }
    }
    .hidden {
      margin-left: -100%;
    }
  }
}
</style>
