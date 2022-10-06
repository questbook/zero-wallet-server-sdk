import { ethers } from 'ethers';

export type SignedTransaction = {
  readonly transactionHash: string;
  readonly r: string;
  readonly s: string;
  readonly v: number;
};

export type BiconomyWalletClient = {
  readonly engine: any;
  readonly biconomyAttributes: any;
  readonly isSignerWithAccounts: any;
  readonly provider: any;
  readonly targetProvider: any;
  readonly walletFactoryAddress: string;
  readonly baseWalletAddress: string;
  readonly entryPointAddress: string;
  readonly handlerAddress: string;
  readonly providerOrSigner: ethers.Signer | ethers.providers.Provider;
  readonly networkId: number;
  readonly walletFactory: ethers.Contract;
  readonly baseWallet: ethers.Contract;
  readonly entryPoint: ethers.Contract;
  readonly checkIfWalletExists: (
    params: CheckIfWalletExistsParams
  ) => Promise<CheckIfWalletExistsType>;
  readonly checkIfWalletExistsAndDeploy: (
    params: CheckIfWalletExistsAndDeployParams
  ) => Promise<CheckIfWalletExistsAndDeployType>;
  readonly buildExecTransaction: (
    params: BuildExecTransactionParams
  ) => Promise<BuildExecTransaction>;
  readonly sendBiconomyWalletTransaction: (
    params: SendBiconomyWalletTransactionParams
  ) => Promise<string>;
};

export type SendBiconomyWalletTransactionParams = {
  readonly execTransactionBody: BuildExecTransaction;
  readonly walletAddress: string;
  readonly signature: string;
  readonly webHookAttributes?: WebHookAttributesType;
};

export type WebHookAttributesType = {
  readonly webHookId: string;
  readonly webHookData: any;
};

export type CheckIfWalletExistsParams = {
  readonly eoa: string;
};

export type CheckIfWalletExistsAndDeployParams = {
  readonly eoa: string;
  readonly webHookAttributes: any;
};

export type CheckIfWalletExistsType = {
  readonly doesWalletExist: boolean;
  readonly walletAddress: string;
};

export type CheckIfWalletExistsAndDeployType = {
  readonly walletAddress: string;
  readonly txHash: string;
};

export type BuildExecTransactionParams = {
  readonly data?: string;
  readonly to: string;
  readonly walletAddress: string;
};

export type BuildExecTransaction = {
  readonly to: string;
  readonly value: number;
  readonly data: string;
  readonly operation: number;
  readonly targetTxGas: number;
  readonly baseGas: number;
  readonly gasPrice: number;
  readonly gasToken: string;
  readonly refundReceiver: string;
  readonly nonce: number;
};

export type SendBiconomyWalletTransaction = string;
