import { DatabaseConfig, fileDoc } from '../types';
import { GasTanksType } from '../types';
import { GasTankProps } from '../types';

export function isGasTankProps(obj: any): obj is GasTankProps {
    if (typeof obj.name !== 'string') return false;
    if (typeof obj.apiKey !== 'string') return false;
    if (typeof obj.name !== 'string') return false;
    if (obj.chainId === undefined) return false;
    if (typeof obj.providerURL !== 'string') return false;
    if (!obj?.whiteList?.length) return false;
    return true;
}

function isGasTanksType(obj: any): obj is GasTanksType {
    if (obj.length === undefined) return false;
    try {
        for (let i = 0; i < obj.length; i++) {
            if (!isGasTankProps(obj[i])) return false;
        }
    } catch {
        return false;
    }
    return true;
}
function isDatabaseConfig(obj: any): obj is DatabaseConfig {
    if (typeof obj.user !== 'string') return false;
    if (typeof obj.host !=='string') return false;
    if (typeof obj.database !== 'string') return false;
    if (typeof obj.password !== 'string') return false;
    if (typeof obj.port !== 'number') return false;
    return true;
}

export function isFileDoc(obj: any): obj is fileDoc {
    if (obj.whiteList === undefined) return false;
    return isDatabaseConfig(obj.databaseConfig) && isGasTanksType(obj.gasTanks);
}
