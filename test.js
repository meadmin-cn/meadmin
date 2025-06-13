  import config  from './dist/config/database.js'; 
  import dotenv from 'dotenv';
  import Sequelize from '@sequelize/core';

  // 根据当前环境加载不同的 .env 文件

    dotenv.config({
      path: ['.env','.env.local'],
      override: true,
    });
  
  
  const sequelize = new Sequelize((await config()).dataSource.default);
    console.log('-----------',sequelize.models.get('User2').modelDefinition.options.comment,sequelize.models.get('User').modelDefinition.options.deletedAt,sequelize.models.get('User').modelDefinition.primaryKeysAttributeNames)
sequelize.close();