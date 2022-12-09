import { ClientConfig, createClient } from "next-sanity";
import createImageUtlBuilder from "@sanity/image-url";

export const config: ClientConfig = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(config);

export const urlFor = (source: any) =>
  createImageUtlBuilder({
    dataset: config.dataset!,
    projectId: config.projectId!,
  }).image(source);
