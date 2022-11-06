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

export const createIndex = 
'CREATE INDEX w ON gasless_login USING HASH (address);'
