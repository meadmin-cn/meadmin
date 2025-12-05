import { installRoute } from '@/router';
import { installStore } from '@/store';
import { event, mitter } from '../index';
import { installIcon } from '@/icons';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
mitter.once(event.START, async (app) => {
  installIcon(app);
  await installStore(app);
  installRoute(app);
  if (!import.meta.env.SSR) {
    window.addEventListener('resize', () => mitter.emit(event.RESIZE));
  }
  // 进度条配置
  nProgress.configure({
    showSpinner: false,
  });
});
