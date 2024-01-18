const axios = require('axios');

const getPoapOwnership = async (poapApiKey: string, address: string, eventId: string) => {
    const eventOwnership = {
        method: 'GET',
        url: `https://api.poap.tech/actions/scan/${address}/${eventId}`,
        headers: {
            accept: 'application/json',
            'x-api-key': poapApiKey
        }
    };
    const response = await axios.request(eventOwnership);
    return response
}

export default getPoapOwnership;