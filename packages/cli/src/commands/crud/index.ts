import { Command, Option } from '../../decorators';
import { resovePath } from '../../utils/formatting';
import { Log } from '../../utils/log';
import { AbstractCommand } from '../abstract.command';
import { CreateDtoService } from './service/create-dto.service';
import { EntityService } from './service/entity.service';
import { UpdateDtoService } from './service/update-dto.service';
@Command('crud <path>', '创建crud')
export class Crud extends AbstractCommand {
  @Option('--baseEntity, -be', '基础entity文件')
  public baseEntity: string;

  @Option('--base, -b', '基础文件夹路径', { default: 'src/app' })
  public base: string;

  private file: string;
  private name: string;
  private entityPath: string;
  private entityName: string;
  private createDtoPath: string;
  private createDtoName: string;
  private updateDtoPath: string;
  private updateDtoName: string;

  public async runCommand() {
    this.file = this.base + '/' + (this.files as string);
    this.name = this.file.split('/').pop()!;
    this.setEntity();
    this.setCreateDto();
    this.setUpdateDto();
  }

  public setEntity() {
    const entity = new EntityService(
      this.file + '/entity/' + this.name,
      this.baseEntity ? this.baseEntity : 'src/entities/' + this.name,
    );
    entity.writeFile();
    this.entityPath = entity.toPath;
    this.entityName = entity.className;
  }

  public setCreateDto() {
    const createDto = new CreateDtoService(
      this.file + '/dto/create-' + this.name,
      this.entityPath,
      this.entityName,
    );
    createDto.writeFile();
    this.createDtoPath = createDto.toPath;
    this.createDtoName = createDto.className;
  }

  public setUpdateDto() {
    const updateDto = new UpdateDtoService(
      this.file + '/dto/update-' + this.name,
      this.createDtoPath,
      this.createDtoName,
    );
    updateDto.writeFile();
    this.updateDtoPath = updateDto.toPath;
    this.updateDtoName = updateDto.className;
  }
}
