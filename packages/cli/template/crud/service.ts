import { Injectable } from '@nestjs/common';
import { __CreateDto__ } from '__-createDto__';
import { __UpdateDto__ } from '__-updateDto__';
import { __Entity__ } from '__-entity__';

@Injectable()
export class __Name__ {
  create(__createDto__: __CreateDto__) {
    return __Entity__.create(__createDto__);
  }

  findAll() {
    return __Entity__.find();
  }

  findOne(id: number) {
    return __Entity__.findOneBy({ id });
  }

  update(id: number, __updateDto__: __UpdateDto__) {
    return __Entity__.update(id, __updateDto__);
  }

  remove(id: number) {
    return __Entity__.delete(id);
  }
}
