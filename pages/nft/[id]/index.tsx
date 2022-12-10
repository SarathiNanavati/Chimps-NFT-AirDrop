import React, { useEffect, useState } from "react";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useChainId,
  useDesiredChainId,
  useNetwork,
  useContract,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityClient, urlFor } from "../../../sanity";
import { Collection } from "../../../typings";
import Link from "next/link";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";

interface NFTDropPageProps {
  collection: Collection;
}
// const nftDrop = useContract("0x1234...", "nft-drop").contract;

const NFTDropPage = ({ collection }: NFTDropPageProps) => {
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const [priceInMATIC, setPriceInMATIC] = useState<string>("");
  const nftDrop = useContract(collection.address, "nft-drop").contract;
  const [loading, setLoading] = useState<boolean>(true);
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();
  const chainId = useChainId();
  const desiredChainId = useDesiredChainId();
  const [, switchNetwork] = useNetwork();

  useEffect(() => {
    if (!nftDrop) return;
    const fetchNFTDropData = async () => {
      setLoading(true);
      const claimed = await nftDrop.getAllClaimed();
      const totalSupply = await nftDrop.totalSupply();
      setClaimedSupply(claimed.length);
      setTotalSupply(totalSupply);
      setLoading(false);
    };
    fetchNFTDropData();
  }, [nftDrop]);

  useEffect(() => {
    if (!nftDrop) return;
    const fetchThePrice = async () => {
      const claimedCondition = await nftDrop.claimConditions.getAll();
      setPriceInMATIC(claimedCondition[0].currencyMetadata.displayValue);
    };
    fetchThePrice();
  }, [nftDrop]);

  useEffect(() => {
    address && chainId != desiredChainId && switchNetwork!(desiredChainId);
  }, [chainId]);

  const handleSignInOut = async () => {
    address ? await disconnect() : await connectWithMetamask();
  };

  const mintNFTHandle = async () => {
    if (!nftDrop || !address) return;
    const quantity = 1;
    const notification = toast.loading("Minting NFT...", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    try {
      setLoading(true);
      const tx = await nftDrop?.claimTo(address, quantity);
      toast.success("Successfully Minted", {
        duration: 8000,
        style: {
          background: "green",
          color: "white",
          fontWeight: "bolder",
          fontSize: "17px",
          padding: "20px",
        },
      });
      console.log("mintNFTHandle", tx[0].receipt, tx[0].id, await tx[0].data());
    } catch (error) {
      console.error(error);
      toast.error("Oops! Something went Wrong ", {
        duration: 8000,
        style: {
          background: "red",
          color: "white",
          fontWeight: "bolder",
          fontSize: "17px",
          padding: "20px",
        },
      });
    } finally {
      setLoading(false);
      toast.dismiss(notification);
    }
  };

  return (
    <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
      <Toaster position='bottom-center' />
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
          {loading ? (
            <p className='pt-2 text-xl text-green-500 animate-bounce'>Loading Supply Count ....</p>
          ) : (
            <p className='pt-2 text-xl text-green-500'>
              {claimedSupply} / {totalSupply?.toString()} NFT's claimed{" "}
            </p>
          )}

          {loading && (
            <img
              className='w-80 h-80 object-contain'
              src='https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif'
            />
          )}
        </div>

        <button
          onClick={mintNFTHandle}
          disabled={loading || claimedSupply === totalSupply.toNumber() || !address}
          className='h-16 w-full bg-red-600 text-white font-bold rounded-full mt-10 disabled:bg-gray-400'>
          {loading ? (
            <>Loading...</>
          ) : claimedSupply === totalSupply.toNumber() ? (
            <>Sold-Out</>
          ) : !address ? (
            <>Sign-In To Mint</>
          ) : (
            <span>Mint NFT ({priceInMATIC} MATIC)</span>
          )}
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
