import { uploadImage as realUpload } from '../admin/src/utils/uploadImage.mjs';
// Exercise the production uploader against a local Cloudinary-shaped endpoint.
export const uploadImage = (options) => realUpload({ ...options, fetcher: (_url, request) => fetch('/demo/cloudinary-upload', request) });
