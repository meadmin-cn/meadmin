import { CodeEunm } from "@/dict/code.enum.js";
import { ApiBaseRes } from "./apiBase.res.js";

export class ApiErrorRes extends ApiBaseRes{
    declare code:  Exclude<CodeEunm, CodeEunm.Success>;
}