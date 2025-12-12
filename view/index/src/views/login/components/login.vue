<template>
  <div class="login">
    <div class="left">
      <div class="form">
        <div class="title">登 录</div>
        <el-form ref="formRef" size="large">
          <el-form-item prop="username">
            <el-input autofocus placeholder="用户名" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密码" clearable show-password />
          </el-form-item>
          <el-form-item prop="captcha">
            <el-input class="captcha-input" placeholder="验证码" clearable>
              <template #append>
                <img
                  class="captcha-img"
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAAAoCAMAAAAFWtJHAAAAw1BMVEXz+/4VVnnP1qnJw9zDsbDAmrWrx6HJ4KDKzZfa0LbevJu93qW70dxok6rX5u2EqLufvcxMf5owaolgfIUuYn3Er5ZHb4Gcp8OYuJwnZH5gjo2Fqpc6coNNgIgrY4VvjKpYfp6ytc9CcZGFmrYtZYBGdIiBjptWeI3BwK5eg493k5eXmqI/eIRpmo9UiYmcvZZCeIKyzptYiYeFrJEqZ36TvJqozZ+osaYrZHxYgoSzvpMrZ31+q5SGoItvkYhCc4Bvm4wEjmNUAAAEK0lEQVRYhbWYCVfUMBCAM23XHts2TWRBEBQVVFYOWQEBD/j/v8qZJO0maUq78JzHZh9tMvN1rjTL2ASZKxmdlqbmbzZj6mNJFNGIF9N0luKUVuJ4XK/FMY4QrxE8aRHIPg0bImjjOGo9L0BQI921GKZ5oQ3EKIKWGcnAHFSB9yIrFBsEYoKQYnRFyAsdAhGOIiTJ0PIRL2iJAwh4ofUMWV8TZNlmCGOBGEZgs65Ioii1KuL/ILBeQbpXIseZGUIEEZIwxlQElpNMQgiLsh9kmIqgzDsMsxlWlOlvE7Ro6yGG9WIM+AiBK+gFZd+U9oAjcKF2XxBBrdELX6EEEBpecVFBM4zQqYo8V5BGw5Cr5UlC4RpEwNk7b5DBhwCACqqqDCIwZiO0o9FB9jVDuzKcC5FJI5orYHeP196Esq44VKzTZINUgpctQp73EFoOC8GpiLJyjJHT3u7tH5DH68a5JYUUrRm3IrgEcXqmZwcQtLjYdqQ4gG1Je+zde3pgASAsQ0ggWUCwE5GHzjFStVKea3G8YNBDBOgGTDKfYXcfH7hpyopbEzEVYAABQwQXZSVFjaYRISLrsZULbiD8wuXSQVB+OwABO44LaCK4Ey0GIb8jXS240JWnjeNYFIWJhLMiipwO1j5caanncAiH0rPXDCJc4p2VZjQIKlfimAAmSAUqxA3IdU6UVIClN5Eu+te0/IAVpS8mi0HIY/qeSmCyjIPklgHZmAL0EJqgihUiID7eFybeMTEgQjGJQtUaLWZ2JLoCXEuNJrh/UcnV6ZU4u24Uokm5OFYIE+wrBKiE98w1yED2U3RCGq7xBpUknAizEdBVGicykGLfwRJbsRt3zuv86PjoONCd52eUJDfXfPnTWG4/jA0FAitkXSZ1IPPQ4RYW9tLkM3zh+bHsRwffSuant5hN1KC7rum/T4QYup0jlGSUipbTqZs3wMuvJzgQj7O/ZNkN3OHcCWchF0F9qYR9vbXoqp06Sll/AGlvCAqBfAUnsFQPZzNk94h3Ds2U41gAgYRXi0WX5oQA8O6wVt2izUe1r33jcLRcJonn4Cxb/arg99VN+kyEmteSby+6YiSEpvr4iZHnm3YLtXZ3HF2GLPvz9/bh9uHx4pkIlHSF1XS71k4pUoOwc0Qx9BDUJnV/J+HxuYEoxda2ZcdCoFcUaXcBHQM1OvmICPiifnlp/n3ipDUgxULi3uAw9N7ZnBjkuVcRGqE7vWyMQI2jkVZXIPu918YkMefeYLnrk2ZqAJ448g4S2BIbDH/efI5P7gTbbEAZSaqP/MxAbAIQ6OCxkvBsG0GtLAp1WnOPbC9G6PS4mubeT0HOwhchDIn/W1L3M4yPkGl5NgIu9dc/hRDwgl7cR5iOoeyHGLQKq/ZUFEK5wPrH941KIuiBDmHgB4COgSpCeXFQjZF/2fY0qBwBIkQAAAAASUVORK5CYII="
                />
              </template>
            </el-input>
          </el-form-item>
          <me-button class="button submit">登录</me-button>
        </el-form>
      </div>
    </div>
    <div class="right">
      <div class="explanation">
        <div class="title">没有账户？</div>
        <div class="desc">立即加入我们吧，点击下方按钮进行注册</div>
        <me-button class="button go" @click="setGo()">注册</me-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Login">
const emit = defineEmits<{
  go: [id: 'login' | 'register'];
}>();
const setGo=()=>{
  emit('go', 'register')
}
</script>
<style lang="scss" scoped>
.login {
  .left {
    background-color: #fff;
  }
}
</style>
