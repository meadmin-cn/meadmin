import { installRoute } from '@/router';
import { installStore } from '@/store';
import { event, mitter } from '../index';
import { installIcon } from '@/icons';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
//服务端渲染期间不能使用once否则第二次访问页面会不触发,后期可以将此部分代码挪到启动函数bootscrapt中
mitter.on(event.START, async (app) => {
  await installStore(app);
  installRoute(app);
  installIcon(app);
  if (!import.meta.env.SSR) {
    window.addEventListener('resize', () => mitter.emit(event.RESIZE));
    // 进度条配置
    nProgress.configure({
      showSpinner: false,
    });
  }
});
