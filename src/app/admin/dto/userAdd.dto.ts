import { ApiProperty } from "@midwayjs/swagger";
import { User } from "../../entity/user.entity.js";
import { OmitDto, Rule, RuleType } from "@midwayjs/validate";


export class UserAddDto extends OmitDto(User, ['id']) {

  @Rule(RuleType.number().max(60).required())
  @ApiProperty({ description: 'The name of the Catage'})
  age: number;
}