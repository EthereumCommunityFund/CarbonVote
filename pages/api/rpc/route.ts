import { IS_PROD } from '@/src/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const baseUrl = !IS_PROD
      ? process.env.NEXT_PUBLIC_INFURA_URL_DEVELOPMENT_BACKUP
      : process.env.NEXT_PUBLIC_INFURA_URL_PRODUCTION_BACKUP;

    const response = await fetch(baseUrl as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'RPC Error' }, { status: 500 });
  }
}
