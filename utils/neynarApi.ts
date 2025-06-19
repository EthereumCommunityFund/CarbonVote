export async function getFarcasterAddresses(fid: number): Promise<string[]> {
  try {
    const options = {
      method: 'GET',
      headers: { 'x-api-key': process.env.NEYNAR_API_KEY || '' },
    };

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      options
    );
    const data = await response.json();

    let addresses: string[] = [];

    if (data?.users && data.users.length > 0) {
      const user = data.users[0];

      if (user.custody_address) {
        addresses.push(user.custody_address);
      }

      if (user.verified_addresses?.eth_addresses) {
        addresses = [...addresses, ...user.verified_addresses.eth_addresses];
      }
    }

    return [...new Set(addresses)];
  } catch (error) {
    console.error('Error fetching Farcaster addresses:', error);
    return [];
  }
}
