import { Rule, RuleType } from "@midwayjs/validate";

export class User {
  @Rule(RuleType.number())
  id: number;

  @Rule(RuleType.string().required())
  firstName: string;

  @Rule(RuleType.string().max(10).required())
  lastName: string;

  @Rule(RuleType.number().max(60).required())
  age: number;
}
