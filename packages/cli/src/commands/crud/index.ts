import { Command, Option } from '../../decorators';
import { resovePath } from '../../utils/formatting';
import { AbstractCommand } from '../abstract.command';
import { EntityService } from './service/entity.service';
@Command('crud <path>', '创建crud')
export class Crud extends AbstractCommand {
  @Option('--baseEntity, -be', '基础entity文件')
  public baseEntity: string;

  @Option('--base, -b', '基础文件夹路径', { default: 'src/app' })
  public base: string;

  private file: string;
  private name: string;
  private entityPath: string;

  public async runCommand() {
    this.file = this.base + '/' + (this.files as string);
    this.name = this.file.split('/').pop()!;
    this.setEntity();
    console.log(this.entityPath);
  }

  public setEntity() {
    const entity = new EntityService(
      this.file + '/entity/' + this.name,
      this.baseEntity ? this.baseEntity : 'src/entities/' + this.name,
    );
    entity.writeFile();
    this.entityPath = entity.toPath;
  }
}
