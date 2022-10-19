import { ethers } from 'ethers';
import { Pool } from 'pg';

import {
    createGaslessLoginTableQuery,
    NONCE_EXPIRATION
} from '../../constants/database';
import { DatabaseConfig, SignedMessage } from '../../types';

import { BaseAuthorizer } from './BaseAuthorizer';

export default class QuestbookAuthorizer implements BaseAuthorizer {
    name = 'Questbook Auhorizer';
    #pool: Pool;
    #loadingTableCreation: Promise<any>;

    constructor(databaseConfig: DatabaseConfig) {
        this.#pool = new Pool(databaseConfig);

        this.#loadingTableCreation = this.#query(createGaslessLoginTableQuery);
    }

    async #query(query: string, values?: Array<any>): Promise<any> {
        // eslint-disable-line @typescript-eslint/no-explicit-any

        await this.#loadingTableCreation;

        try {
            const res = await this.#pool.query(query, values);
            return res;
        } catch (err) {
            throw new Error(err as string);
        }
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

    async addAuthorizedUser(address: string) {
        const newNonce = this.#createNonce(100);

        await this.#query(`INSERT INTO gasless_login VALUES ($1, $2, $3);`, [
            address,
            newNonce,
            NONCE_EXPIRATION + new Date().getTime() / 1000
        ]);
    }

    async refreshUserAuthorization(address: string) {
        if (!(await this.#doesAddressExist(address))) {
            throw new Error('User not authorized!');
        }

        const newNonce = this.#createNonce(100);

        await this.#query(
            'UPDATE gasless_login SET nonce = $1 WHERE address = $2;',
            [newNonce, address]
        );

        return newNonce;
    }

    async #doesAddressExist(address: string) {
        const results = await this.#query(
            'SELECT * FROM gasless_login WHERE address = $1;',
            [address]
        );

        if (results.rows.length === 0) {
            return false;
        }

        return true;
    }

    async getNonce(address: string): Promise<boolean | string> {
        const results = await this.#query(
            'SELECT nonce, expiration FROM gasless_login WHERE address = $1 ORDER BY expiration DESC',
            [address]
        );

        if (results.rows.length === 0) {
            return false;
        }

        if (results.rows[0].expiration <= new Date().getTime() / 1000) {
            return false;
        }

        return results.rows[0].nonce;
    }

    async isUserAuthorized(address: string, nonce: string) {
        const results = await this.#query(
            'SELECT * FROM gasless_login WHERE address = $1 AND nonce = $2;',
            [address, nonce]
        );

        if (results.rows.length === 0) {
            return false;
        }

        const expiration = results.rows[0].expiration;

        const curDate = new Date().getTime() / 1000;

        return expiration > curDate;
    }

    recoverAddress(signedMessage: SignedMessage) {
        const address = ethers.utils.recoverAddress(
            signedMessage.transactionHash,
            {
                r: signedMessage.r,
                s: signedMessage.s,
                v: signedMessage.v
            }
        )
        
        return address
    }
}
