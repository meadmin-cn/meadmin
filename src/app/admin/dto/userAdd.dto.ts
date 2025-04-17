import { User } from "../../entity/user.entity.js";
import { OmitDto } from "@midwayjs/validate";

export class UserAddDto extends OmitDto(User, ['id']) {

}