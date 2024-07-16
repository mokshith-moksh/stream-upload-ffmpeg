import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable, PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import * as dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: `${process.env.END_POINT}`,
  credentials: {
    accessKeyId: `${process.env.ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.SECRET_ACCESS_KEY}`,
  },
});
const inputBucket = "bucket1";
const inputKey = "video1.mp4";
const outputBucket = "bucket1";
const outputKey = "path/to/output.mpd";

const getInputStreamFromR2 = async (
  bucket: string,
  key: string
): Promise<Readable> => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);
  if (response.Body instanceof Readable) {
    return response.Body;
  }
  throw new Error("Response body is not a Readable stream");
};

const uploadStreamToR2 = (bucket: string, key: string): PassThrough => {
  const pass = new PassThrough();
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: pass,
    },
    leavePartsOnError: false,
  });
  upload
    .done()
    .then((data) => console.log("Successfully uploaded to R2: " + data.Key))
    .catch((err) => console.log("Error uploading to R2: " + err.message));

  return pass;
};
(async () => {
  try {
    const inputStream = await getInputStreamFromR2(inputBucket, inputKey);
    const outputStream = uploadStreamToR2(outputBucket, outputKey);

    // Convert video to DASH format
    ffmpeg(inputStream)
      .outputOptions([
        "-vf scale=320:240", // scale video
        "-c:v libx264", // video codec
        "-c:a libmp3lame", // audio codec
        "-f dash", // output format
      ])
      .on("error", function (err: Error) {
        console.log("An error occurred: " + err.message);
      })
      .on("end", function () {
        console.log("Processing finished!");
      })
      .pipe(outputStream, { end: true });
  } catch (err) {
    console.log("Error: ", err);
  }
})();
