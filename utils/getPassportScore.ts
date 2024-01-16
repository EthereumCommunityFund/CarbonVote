const API_BASE_URL = 'https://api.scorer.gitcoin.co/registry';
const gitcoinApiKey = process.env.GITCOIN_API_KEY ?? '';

export function submitAndFetchScore(address: string, scorerId: string) {
    const scoreData = { address, scorerId };
    const requestBody = {
        address,
        scorer_id: scorerId
    };

    const headers = new Headers({
        'Content-Type': 'application/json',
        'X-API-KEY': gitcoinApiKey
    });
    console.log(headers, 'headers');
    return fetch(`${API_BASE_URL}/submit-passport`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error in submitPassport');
            }
            return response.json();
        });
}
