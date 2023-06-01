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
  private createDtoPath: string;
  private updateDtoPath: string;

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
  }

  public setCreateDto() {
    const createDto = new CreateDtoService(
      this.file + '/dto/create-' + this.name,
      this.entityPath,
    );
    createDto.writeFile();
    this.createDtoPath = createDto.toPath;
  }

  public setUpdateDto() {
    const updateDto = new UpdateDtoService(
      this.file + '/dto/update-' + this.name,
      this.createDtoPath,
    );
    updateDto.writeFile();
    this.updateDtoPath = updateDto.toPath;
  }
}
