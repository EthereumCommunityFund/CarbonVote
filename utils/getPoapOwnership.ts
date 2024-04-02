const axios = require('axios');

const getPoapOwnership = async (
  poapApiKey: string,
  address: string,
  eventId: string
) => {
  try {
    const eventOwnership = {
      method: 'GET',
      url: `https://api.poap.tech/actions/scan/${address}/${eventId}`,
      headers: {
        accept: 'application/json',
        'x-api-key': poapApiKey,
      },
    };
    const response = await axios.request(eventOwnership);
    return response.data;
  } catch (error) {
    return error;
  }
};

export default getPoapOwnership;
