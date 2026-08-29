import { InjectRepository, Transaction } from '@/decorators/index.js';
import * as bullmq from '@midwayjs/bullmq';
import { BullMQQueue } from '@midwayjs/bullmq';
import { Inject, Provide } from '@midwayjs/core';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';
import { MidwayI18nService } from '@midwayjs/i18n';
import { InferAttributes, Op, WhereOperators } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';
import { Job } from '../../../entities/job.entity.js';
import { JobCreateDto } from '../dto/jobCreate.dto.js';
import { JobQueryDto } from '../dto/jobQuery.dto.js';
import { JobStartDto } from '../dto/jobStart.dto.js';
import { processorOptions } from '../processor/default.options.js';

//任务
@Provide()
export class JobService {
  @InjectRepository(Job)
  jobRepository: typeof Job;

  @Inject()
  i18nService: MidwayI18nService;

  @Inject()
  bullmqFramework: bullmq.Framework;

  /**
   * 获取调度id
   * @param name
   * @returns
   */
  getSchedulerId(name: string) {
    return 'scheduler-' + name;
  }

  /**
   * 获取任务id
   * @param name
   * @returns
   */
  getJobId(name: string) {
    return 'job-' + name;
  }

  async beginJob(entity: Job) {
    let queueName = entity.queueName;
    let queueOptions: Record<string, any> = {};
    if (entity.type === 1) {
      queueName = 'sql-task';
      queueOptions = {
        sql: entity.sql,
      };
    } else if (entity.type === 2) {
      queueName = 'curl-task';
      queueOptions = {
        headers: entity.headers ? JSON.parse(entity.headers) : undefined,
        method: entity.method,
        query: entity.query ? JSON.parse(entity.query) : undefined,
        body: entity.body ? JSON.parse(entity.body) : undefined,
      };
    } else {
      if (entity.queueOptions) {
        queueOptions = JSON.parse(entity.queueOptions) as Record<string, any>;
      }
    }
    const jobOptions = {} as NonNullable<Parameters<BullMQQueue['addJobToQueue']>[1]>;
    if (entity.deduplication === 2) {
      //去重策略:1=可重复;2=去重;3=覆盖
      jobOptions.deduplication = { id: entity.name };
    } else if (entity.deduplication === 3) {
      jobOptions.deduplication = { id: entity.name, keepLastIfActive: true };
    }
    if (entity.strategy === 2) {
      //执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行,
      jobOptions.delay = entity.delay;
    }
    const queue = this.bullmqFramework.getQueue(queueName) ?? this.bullmqFramework.createQueue(queueName, processorOptions[queueName]?.queueOptions);
    if (entity.strategy === 3) {
      await queue.upsertJobScheduler(
        this.getSchedulerId(entity.name),
        {
          pattern: entity.cron,
        },
        {
          name: entity.name,
          data: queueOptions,
          opts: jobOptions, // Optional additional job options
        },
      );
    } else {
      jobOptions.jobId = this.getJobId(entity.name);
      await queue.add(entity.name, queueOptions, jobOptions);
    }
  }

  /**
   * 创建数据
   * @param createDto
   * @returns
   */
  @Transaction()
  async create(createDto: JobCreateDto) {
    const entity = await this.jobRepository.create(createDto);
    await this.beginJob(entity);
    return entity;
  }

  /**
   * 列表分页查询
   * @param queryDto 查询条件
   * @returns
   */
  @Transaction()
  async list(queryDto: JobQueryDto) {
    const where = {} as WhereAttributeHash<InferAttributes<Job, { omit: never }>>;
    (Object.keys(queryDto) as Array<keyof JobQueryDto>).forEach((key) => {
      if ('page' === key || 'pageSize' === key) {
        return;
      }
      if (null === queryDto[key] || undefined === queryDto[key] || '' === queryDto[key]) {
        return;
      }
      if (key === 'startCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<NonNullable<Job['createdAt']>>;
        where['createdAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endCreatedAt') {
        where['createdAt'] = (where['createdAt'] ?? {}) as WhereOperators<NonNullable<Job['createdAt']>>;
        where['createdAt'][Op.lte] = queryDto[key];
        return;
      }
      if (key === 'startUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<NonNullable<Job['updatedAt']>>;
        where['updatedAt'][Op.gte] = queryDto[key];
        return;
      }
      if (key === 'endUpdatedAt') {
        where['updatedAt'] = (where['updatedAt'] ?? {}) as WhereOperators<NonNullable<Job['updatedAt']>>;
        where['updatedAt'][Op.lte] = queryDto[key];
        return;
      }
      (where as Record<keyof typeof where, any>)[key] = queryDto[key]; //因为 where[key as Exclude<typeof key,'page'|'pageSize'>] = queryDto[key]; 赋值会触发 TS2590: Expression produces a union type that is too complex to represent.
    });
    const { count, rows } = await this.jobRepository.findAndCountAll({
      where,
      offset: (queryDto.page - 1) * queryDto.pageSize,
      limit: queryDto.pageSize,
      include: ['createdAdmin', 'updatedAdmin'],
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
  @Transaction()
  async findOne(id: string) {
    const entity = await this.jobRepository.findByPk(id, { include: ['createdAdmin', 'updatedAdmin'] });
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    return entity;
  }

  /**
   * 启动任务
   * @param id 主键
   * @param updateDto 数据对象
   * @returns
   */
  @Transaction()
  async start(id: string, updateDto: JobStartDto) {
    let entity = await this.jobRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    if (entity.strategy !== 4) {
      throw new BadRequestError(this.i18nService.translate('请停止任务后再启动'));
    }
    Object.assign(entity, updateDto);
    entity = await entity.save();
    await this.beginJob(entity);
    return entity;
  }

  @Transaction()
  async stop(id: string, ignoreStopError = false) {
    const entity = await this.jobRepository.findByPk(id);
    if (!entity) {
      throw new BadRequestError(this.i18nService.translate('没有对应的信息'));
    }
    if (entity.strategy === 4) {
      if (ignoreStopError) {
        return entity;
      }
      throw new BadRequestError(this.i18nService.translate('任务已停止，无需重复操作'));
    }
    let queueName = entity.queueName;
    if (entity.type === 1) {
      queueName = 'sql-task';
    } else if (entity.type === 2) {
      queueName = 'curl-task';
    }
    if (entity.strategy === 3) {
      //执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行,
      await this.bullmqFramework.getQueue(queueName).removeJobScheduler(this.getSchedulerId(entity.name));
    } else {
      await this.bullmqFramework.getQueue(queueName).remove(this.getJobId(entity.name));
    }
    entity.strategy = 4;
    await entity.save();
    return entity;
  }

  /**
   * 删除数据
   * @param id 主键
   * @returns
   */
  @Transaction()
  async remove(id: string) {
    const entity = await this.stop(id, true);
    await entity.destroy();
  }
}
