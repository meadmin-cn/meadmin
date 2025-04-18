import { User } from "../../entity/user.entity.js";
import { OmitDtoType } from "@/helper/swaggerHelper.js";


export class UserAddDto extends OmitDtoType(User, ['id']) {

}