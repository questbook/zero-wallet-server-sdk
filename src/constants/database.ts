export const NONCE_EXPIRATION = 86400 * 365; // 1 year

export const createGaslessLoginTableQuery =
    ' \
CREATE TABLE IF NOT EXISTS gasless_login ( \
    address VARCHAR ( 70 ) NOT NULL, \
    nonce VARCHAR ( 256 ) NOT NULL, \
    expiration INT NOT NULL ,\
    gasTankID VARCHAR (256) NOT NULL\
); \
';
export const createScwWhitelistTable =
    ' \
CREATE TABLE IF NOT EXISTS scwWhitelist ( \
    address VARCHAR ( 70 ) NOT NULL, \
    gasTankID VARCHAR (256) NOT NULL\
    );';

export const createIndexForScwWhitelistTable =
    'CREATE INDEX scwWhitelistIndex ON scwWhitelist USING HASH (address);';

export const createIndexForGasLessLoginTable =
    'CREATE INDEX gasLessLoginIndex ON gasless_login USING HASH (address);';
