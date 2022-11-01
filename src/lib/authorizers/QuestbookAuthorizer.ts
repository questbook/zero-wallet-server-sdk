import { ethers } from 'ethers';
import { Pool, QueryResult } from 'pg';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #loadingTableCreation: Promise<QueryResult<any>>;
    #gasTankName: string;

    constructor(
        databaseConfig: DatabaseConfig,
        whiteList: string[],
        gasTankName: string
    ) {
        this.#pool = new Pool(databaseConfig);

        this.#loadingTableCreation = this.#query(createGaslessLoginTableQuery);

        this.#whiteList = whiteList;

        this.#gasTankName = gasTankName;
    }

    isInWhiteList(address: string): boolean {
        return this.#whiteList.includes(address);
    }

    async addAuthorizedUser(address: string) {
        if (await this.#doesAddressExist(address)) {
            throw new Error(
                'User already registered! Please use refreshUserAuthorization instead.'
            );
        }

        const newNonce = this.#createNonce(100);

        await this.#query(
            `INSERT INTO gasless_login VALUES ($1, $2, $3, $4);`,
            [
                address,
                newNonce,
                NONCE_EXPIRATION + new Date().getTime() / 1000,
                this.#gasTankName
            ]
        );
    }

    async refreshUserAuthorization(address: string) {
        if (!(await this.#doesAddressExist(address))) {
            throw new Error('User not Registered!');
        }

        const newNonce = this.#createNonce(100);

        await this.#query(
            'UPDATE gasless_login SET nonce = $1 WHERE address = $2 AND gasTankID = $3;',
            [newNonce, address, this.#gasTankName]
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

    async #getDatabaseReady() {
        await this.#loadingTableCreation;
        try {
            await this.#pool.query(createIndex);
        } catch (err) {
            throw new Error(err as string);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async #query(query: string, values?: Array<any>): Promise<any> {
        await this.#getDatabaseReady();

        try {
            const res = await this.#pool.query(query, values);
            return res;
        } catch (err) {
            throw new Error(err as string);
        }
    }

    async #retrieveValidRecord(address: string, nonce: string) {
        const results = await this.#query(
            'SELECT * FROM gasless_login WHERE address = $1 AND nonce = $2 ANd gasTankID = $3;',
            [address, nonce, this.#gasTankName]
        );

        if (results.rows.length === 0) {
            return false;
        }

        const expiration = results.rows[0].expiration;

        const curDate = new Date().getTime() / 1000;

        return expiration > curDate;
    }

    async #doesAddressExist(address: string) {
        const results = await this.#query(
            'SELECT * FROM gasless_login WHERE address = $1 AND gasTankID= $2 ;',
            [address, this.#gasTankName]
        );

        if (results.rows.length === 0) {
            return false;
        }

        return true;
    }

    async getNonce(
        address: string
    ): Promise<boolean | string> {
        const results = await this.#query(
            'SELECT nonce, expiration FROM gasless_login WHERE address = $1 AND gasTankID = $2 ORDER BY expiration DESC',
            [address, this.#gasTankName]
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
