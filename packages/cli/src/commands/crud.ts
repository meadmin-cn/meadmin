import { Command } from '../decorators';
import { AbstractCommand } from './abstract.command';
import { main } from '@nestjs/schematics/dist/lib/resource/resource.factory';
@Command('crud <path>', '创建crud')
export class Crud extends AbstractCommand {
  public async runCommand() {
    console.log(
      await main({
        name: this.files as string,
        language: 'ts',
        type: 'rest',
        crud: true,
        flat: true,
      }),
    );
  }
}
