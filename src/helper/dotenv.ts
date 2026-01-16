import dotenv from 'dotenv';
// 根据当前环境加载不同的 .env 文件
if (process.env.NODE_ENV) {
  dotenv.config({
    path: ['.env', `.env.${process.env.NODE_ENV}`],
    override: true,
  });
} else {
  dotenv.config({
    path: ['.env'],
    override: true,
  });
}
