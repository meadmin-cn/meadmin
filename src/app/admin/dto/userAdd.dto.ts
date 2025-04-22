import { User } from "../../entity/user.js";
import { OmitDtoType } from "@/helper/swagger.helper.js";


export class UserAddDto extends OmitDtoType(User, ['id']) {

}