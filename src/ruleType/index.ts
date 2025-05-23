import { RuleType as DefaultRuleType} from '@midwayjs/validate';
import {initRuleType as initStringRule} from './string.js';
export let RuleType = initStringRule(DefaultRuleType);