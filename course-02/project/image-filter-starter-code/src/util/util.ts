import fs from "fs";
import Jimp from "jimp";
import axios from "axios";

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  const response = await axios.get(inputURL, { responseType: "arraybuffer" });
  const photo = await Jimp.read(response.data);
  const outpath = `${__dirname}/tmp/filtered.${Math.floor(
    Math.random() * 2000
  )}.${photo.getExtension()}`;

  await photo
    .resize(256, 256) // resize
    .quality(60) // set JPEG quality
    .greyscale() // set greyscale
    .writeAsync(outpath);

  return outpath;
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
