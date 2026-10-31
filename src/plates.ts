import rawPlates from './data/plates.json';
import { buildPools, type PlateCode } from './game/questions';

export const pools = buildPools(rawPlates as PlateCode[]);
