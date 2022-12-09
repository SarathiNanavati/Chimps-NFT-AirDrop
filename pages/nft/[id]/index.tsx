import React, { useEffect } from "react";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useChainId,
  useDesiredChainId,
  useNetwork,
  ConnectWallet,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityClient, urlFor } from "../../../sanity";
import { Collection } from "../../../typings";
import Link from "next/link";

interface NFTDropPageProps {
  collection: Collection;
}

const NFTDropPage = ({ collection }: NFTDropPageProps) => {
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();
  const chainId = useChainId();
  const desiredChainId = useDesiredChainId();
  const [, switchNetwork] = useNetwork();

  console.log(address, chainId);

  useEffect(() => {
    address && chainId != desiredChainId && switchNetwork!(desiredChainId);
  }, [chainId]);

  const handleSignInOut = async () => {
    address ? await disconnect() : await connectWithMetamask();
  };

  return (
    <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
      <div className='lg:col-span-4 bg-gradient-to-br from-cyan-800 to-rose-500'>
        <div className='flex flex-col items-center justify-center py-2 lg:min-h-screen'>
          <div className='bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl'>
            <img
              className='w-44 rounded-xl object-cover lg:h-96 lg:w-72'
              src={urlFor(collection.previewImage).url()}
            />
          </div>
          <div className='text-center p-5 space-y-2'>
            <h1 className='text-4xl font-bold text-white'></h1>
            <h2 className='text-xl text-gray-300'>{collection.description}</h2>
          </div>
        </div>
      </div>
      <div className='flex flex-1 flex-col p-12 lg:col-span-6'>
        <header className='flex items-center justify-between'>
          <Link href={"/"}>
            <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>
              The{" "}
              <span className='font-extrabold underline decoration-pink-600/50'>
                {collection.nftCollectionName.toUpperCase()}
              </span>{" "}
              NFT Marketplace
            </h1>
          </Link>
          <button
            onClick={() => handleSignInOut()}
            className='rounded-full bg-rose-400 px-4 py-2 text-white text-xs font-bold lg:px-5 lg:py-3 lg:text-base'>
            {address ? "Sign Out" : "Sign In"}
          </button>
        </header>
        <hr className='my-2 border' />
        {address && (
          <p className='text-center text-sm text-rose-400'>
            You are logged-In with wallet {address.substring(0, 5)}...
            {address.substring(address.length - 5)}
          </p>
        )}
        <div className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center'>
          <img
            className='w-80 object-cover pb-10 lg:h-40'
            src={urlFor(collection.mainImage).url()}
          />
          <h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold'>{collection.title}</h1>
          <p className='pt-2 text-xl text-green-500'>12 /21 NFT's claimed </p>
        </div>

        <button className='h-16 w-full bg-red-600 text-white font-bold rounded-full mt-10'>
          {" "}
          Mint NFT (0.01 ETH)
        </button>
      </div>
    </div>
  );
};

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
        _id,
        title,
        address,
        description,
        nftCollectionName,
        mainImage{
          asset
        },
        previewImage{
          asset
        },
        slug{
          current
        },
        creator ->{
          _id,
          name,
          address,
          slug{
            current
          }
        }
    }`;

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });

  if (Object.keys(collection).length === 0) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
    },
  };
};
