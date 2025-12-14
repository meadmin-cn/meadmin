import { UpStorageFunction } from "../../types/fileManage.js";
import { LocalStorage } from "./storage/local.js";
export interface UploadStorageInterface{
  [key:string]:UpStorageFunction;
}
class UploadStorage implements UploadStorageInterface{
  [key:string]:UpStorageFunction;
  localStorage(model:string){
    return new LocalStorage(model);
  }
}
export const uploadStorage = new UploadStorage();