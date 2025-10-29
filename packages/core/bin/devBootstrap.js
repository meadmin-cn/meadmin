#!/usr/bin/env node
import { run } from 'mwtsc';
import { check } from 'mwtsc/lib/version/check.js'
import { rmSync } from 'node:fs';
import {resolve} from 'node:path';
const tempCache = resolve(process.cwd(), 'node_modules/.meadmin/temp/');
rmSync(tempCache,{force:true,recursive:true});
check(run);