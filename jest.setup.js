const  Test = require ('@nestjs/testing').Test;
const CoreModule = require('./dist/app/core/core.module').CoreModule;
const DataSource = require('typeorm').DataSource;
module.exports = async function () {
  //测试数据库初始化
  const module = await Test.createTestingModule({
    imports: [CoreModule.forRoot()],
  }).compile();
  await module.get(DataSource).synchronize(true);
};
