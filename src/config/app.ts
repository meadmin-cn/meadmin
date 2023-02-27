export default () => ({
  port: parseInt(process.env.APP_PORT ?? '3000', 10), //启动端口
});
