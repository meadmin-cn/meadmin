import { ApiProperty } from "@midwayjs/swagger";
import { Rule, RuleType } from "@midwayjs/validate";

export class User {
  @Rule(RuleType.number())
  @ApiProperty({ description: 'The name of the Catage'})
  id: number;

  @Rule(RuleType.string().required())
  @ApiProperty({ description: 'The name of the Catage'})
  firstName: string;

  @Rule(RuleType.string().max(10).required())
  @ApiProperty({ description: 'The name of the Catage'})
  lastName: string;

  @Rule(RuleType.number().max(60).required())
  @ApiProperty({ description: 'The name of the Catage'})
  age: number;
}
