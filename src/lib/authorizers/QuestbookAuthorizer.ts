import { ethers } from 'ethers';
import { Client, Pool, QueryResult } from 'pg';

import {
    createGaslessLoginTableQuery,
    createIndex,
    NONCE_EXPIRATION
} from '../../constants/database';
import { DatabaseConfig, SignedMessage } from '../../types';

import { BaseAuthorizer } from './BaseAuthorizer';

export default class QuestbookAuthorizer implements BaseAuthorizer {
    name = 'Questbook Auhorizer';
    #pool: Pool;
    #whiteList: Array<string>;
    loadingTableCreationWithIndex: Promise<void>;
    #gasTankID: string;
    databaseConfig: DatabaseConfig;

    constructor(
        databaseConfig: DatabaseConfig,
        whiteList: string[],
        gasTankID: string
    ) {
        this.databaseConfig = databaseConfig;
        this.#pool = new Pool(databaseConfig);
        
        this.loadingTableCreationWithIndex = this.getDatabaseReadyWithIndex();
        this.#whiteList = whiteList;

        this.#gasTankID = gasTankID;
    }

    async delete() {
        try {
            await this.#unsafeQuery('DROP INDEX IF EXISTS w;');
            await this.#unsafeQuery('DROP TABLE IF EXISTS gasless_login;');
        } catch (err) {
            throw new Error(err as string);
        }
    }

    isInWhiteList(contractAddress: string): boolean {
        return this.#whiteList.includes(contractAddress);
    }

    async addAuthorizedUser(address: string) {
        if (await this.doesAddressExist(address)) {
            throw new Error(
                'User already registered! Please use refreshUserAuthorization instead.'
            );
        }

        const newNonce = this.#createNonce(100);

        try {
            await this.#query(
                `INSERT INTO gasless_login VALUES ($1, $2, $3, $4);`,
                [
                    address,
                    newNonce,
                    NONCE_EXPIRATION + Math.trunc(new Date().getTime() / 1000),
                    this.#gasTankID
                ]
            );
        } catch (err) {
            throw new Error(err as string);
        }
    }

    async deleteUser(address: string): Promise<void> {
        if (!(await this.doesAddressExist(address))) {
            throw new Error('User does not exist!');
        }
        await this.#query(
            'DELETE FROM gasless_login WHERE address = $1 AND gasTankID = $2 ;',
            [address, this.#gasTankID]
        );
    }

    async refreshUserAuthorization(address: string) {
        if (!(await this.doesAddressExist(address))) {
            throw new Error('User not Registered!');
        }

        const newNonce = this.#createNonce(100);

        await this.#query(
            'UPDATE gasless_login SET nonce = $1 WHERE address = $2 AND gasTankID = $3;',
            [newNonce, address, this.#gasTankID]
        );

        return newNonce;
    }

    async isUserAuthorized(
        signedNonce: SignedMessage,
        nonce: string,
        webwallet_address: string
    ) {
        const address = this.#recoverAddress(signedNonce);

        if (address !== webwallet_address) {
            return false;
        }

        if (ethers.utils.hashMessage(nonce) !== signedNonce.transactionHash) {
            return false;
        }

        return await this.#retrieveValidRecord(address, nonce);
    }

    async getDatabaseReadyWithIndex() {
        try {
            await this.delete();
        } catch {
            throw new Error("Couldn't delete table");
        }

        try {
            await this.#unsafeQuery(createGaslessLoginTableQuery);
        } catch (err) {
            throw new Error(err as string);
        }
        try {
            await new Promise((resolve, reject) => {
                setTimeout(resolve, 3000);
            })
            await this.#unsafeQuery(createIndex);
        } catch (err) {
            console.log(err);
        }

        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async #query(query: string, values?: Array<any>): Promise<any> {
        await this.loadingTableCreationWithIndex;
        return await this.#unsafeQuery(query, values);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async #unsafeQuery(query: string, values?: Array<any>): Promise<any> {
        try {
            const pool = new Pool(this.databaseConfig);
            const res = await pool.query(query, values);
            await pool.end();

            return res;
        } catch (err) {
            throw new Error(err as string);
        }
    }

    async #retrieveValidRecord(address: string, nonce: string) {
        const results = await this.#query(
            'SELECT * FROM gasless_login WHERE address = $1 AND nonce = $2 ANd gasTankID = $3;',
            [address, nonce, this.#gasTankID]
        );

        if (results.rows.length === 0) {
            return false;
        }

        const expiration = results.rows[0].expiration;

        const curDate = new Date().getTime() / 1000;

        return expiration > curDate;
    }

    async doesAddressExist(address: string): Promise<boolean> {
        const results = await this.#query(
            'SELECT * FROM gasless_login WHERE address = $1 AND gasTankID= $2 ;',
            [address, this.#gasTankID]
        );

        if (results.rows.length === 0) {
            return false;
        }

        return true;
    }

    async getNonce(address: string): Promise<boolean | string> {
        const results = await this.#query(
            'SELECT nonce, expiration FROM gasless_login WHERE address = $1 AND gasTankID = $2 ORDER BY expiration DESC',
            [address, this.#gasTankID]
        );

        if (results.rows.length === 0) {
            return false;
        }

        if (results.rows[0].expiration <= new Date().getTime() / 1000) {
            return false;
        }

        return results.rows[0].nonce;
    }

    #createNonce = (length: number) => {
        let result = '';

        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }

        return result;
    };

    #recoverAddress(signedMessage: SignedMessage) {
        const address = ethers.utils.recoverAddress(
            signedMessage.transactionHash,
            {
                r: signedMessage.r,
                s: signedMessage.s,
                v: signedMessage.v
            }
        );

        return address;
    }
}
