import axios from 'axios';

export const addWorkspace = async (
    workspaceName: string,
    networkId: string,
    authToken: string | undefined
) => {
    if (!authToken) {
        throw new Error('No Auth Token Found!');
    }

    const url =
        'https://api.biconomy.io/api/v1/workspace/public-api/create-workspace';

    const formData = new URLSearchParams({
        workspaceName: workspaceName,
        networkId: networkId,
        enableBiconomyWallet: 'true'
    });

    const requestOptions = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            authToken: authToken
        },
        data: formData
    };

    const res = await axios.post(url, requestOptions);
    const resJson = await res.data;

    return {
        apiKey: resJson.data.apiKey,
        fundingKey: resJson.data.fundingKey.toString()
    };
};
