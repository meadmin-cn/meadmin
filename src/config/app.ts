import { AppConfig } from '@/interfaces/config/app.inerface';

export default (): AppConfig => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10), //启动端口
  debug: process.env.NODE_ENV === 'devdevelopment',
});
