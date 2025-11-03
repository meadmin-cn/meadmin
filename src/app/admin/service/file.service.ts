import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { InjectRepository } from '@/decorators/index.js';
import { Provide, Inject } from '@midwayjs/core';
import { FileCreateDto } from '../dto/fileCreate.dto.js';
import { FileQueryDto } from '../dto/fileQuery.dto.js';
import { FileUpdateDto } from '../dto/fileUpdate.dto.js';
import { File } from '../../../entities/file.entity.js';
import { I18nService } from '@/service/i18n.service.js';
import { Op } from '@sequelize/core';
import { UploadStreamFileInfo } from '@midwayjs/busboy';
import { resolve } from 'path';
import { createWriteStream, renameSync, statSync } from 'fs';

//附件
@Provide()
export class FileService {
  @InjectRepository(File)
  FileRepository: typeof File;

  @Inject()
  i18nService: I18nService;

  //保存文件
  async saveFie({filename, data }: UploadStreamFileInfo, md5:string, savePath:string, tmpPath:string){
    const suffix = filename.substring(filename.lastIndexOf('.')); //后缀带着.
    const tmpFilePath = resolve(tmpPath, '__tmp__'+ process.pid + '__'+ md5 + suffix);//临时文件带上进程id防止重复
    const saveFilePath = resolve(savePath, md5 + suffix);
    const saveStat = statSync(saveFilePath,{throwIfNoEntry:false});
    if(saveStat){
      return {size:saveStat.size, path:saveFilePath };//已存在无需上传
    }
    return await new Promise<{size:number,path:string}>((reslove, reject) => {
      const stream = createWriteStream(tmpFilePath);
      stream.on('close', () => {
        renameSync(tmpFilePath, saveFilePath);
        reslove({size: statSync(saveFilePath,{throwIfNoEntry:true}).size, path:saveFilePath});
      });
      stream.on('error', (e) => {
        reject(e);
      });
      data.pipe(stream);
    });
  }

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  async create(createDto: FileCreateDto) {
    const entity = this.FileRepository.build(createDto);
    return await entity.save();
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  async list(queryDto: FileQueryDto) {
    const where = {};
    Object.keys(queryDto).forEach((key) => {
      if (['page', 'pageSize'].includes(key)) {
        return;
      }
      if ([null, undefined, ''].includes(queryDto[key])) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = where['createdAt'] ?? {};
        where['createdAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = where['createdAt'] ?? {};
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = where['updatedAt'] ?? {};
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = where['updatedAt'] ?? {};
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      where[key] = queryDto[key];
    });
    const { count, rows } = await this.FileRepository.findAndCountAll({
      include:['createdAdmin'],
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      order: [['createdAt', 'DESC']],
    });
    return {
      list: rows,
      total: count,
      page: queryDto.page,
      pageSize: queryDto.pageSize,
    };
  }

  /**
   * 根据主键获取一条信息
   * @param id 主键
   * @returns
   */
  async findOne(id: string) {
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }

  /**
   * 更新数据
   * @param id 主键
   * @param updateDto 数据对象
   * @returns
   */
  async update(id: string, updateDto: FileUpdateDto) {
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    Object.assign(entity, updateDto);
    return await entity.save();
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  async remove(id: string) {
    const entity = await this.FileRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    await entity.destroy();
  }
}
