// This file is kept for potential future use but is no longer the primary source of images.
// Images are now handled by user uploads to Firebase Storage.
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
