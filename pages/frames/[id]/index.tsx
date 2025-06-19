import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';
import {
  fetchMetadata,
  metadataToMetaTags,
} from 'frames.js/next/pages-router/client';
import { getHost } from '@/utils/url';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const id = context.params?.id;
  if (!id || Array.isArray(id)) {
    return { notFound: true };
  }

  const baseUrl = getHost();

  try {
    const metadata = await fetchMetadata(
      new URL(`/api/frames/result?Id=${id}`, baseUrl)
    );
    if (!metadata || !metadata['fc:frame']) {
      console.error('No frame metadata found');
      return { notFound: true };
    }
    return {
      props: { metadata },
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { notFound: true };
  }
};

export default function Page({
  metadata,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Carbonvote Frames</title>
        {metadataToMetaTags(metadata)}
      </Head>
    </>
  );
}
