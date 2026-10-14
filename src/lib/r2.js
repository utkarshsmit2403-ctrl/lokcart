import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "c1de4a96113dc4bbef441e5baee2ce7e";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "5810cd5727c607624d1d1614d6340e59";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "6b7e950464919aec1e9a13d78b323679e22ffeb61e34e5b725029a84c3453a20";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "gpgaya";
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || "https://cdn.gpgaya.in";
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function generatePresignedUploadUrl(fileName, fileType) {
  const fileKey = `crafts/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${fileKey}`;

    return { uploadUrl, fileKey, publicUrl };
  } catch (err) {
    console.error("R2 Presigned URL Error:", err);
    return {
      uploadUrl: "",
      fileKey,
      publicUrl: `https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80`,
      error: err.message,
    };
  }
}

export async function uploadBufferToR2(buffer, fileName, contentType = "image/jpeg") {
  const cleanName = (fileName || "craft.jpg").replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileKey = `crafts/${Date.now()}-${cleanName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${fileKey}`;
    return { success: true, fileKey, publicUrl };
  } catch (err) {
    console.error("R2 Direct Buffer Upload Error:", err);
    return {
      success: false,
      error: err.message,
      fileKey,
      publicUrl: `https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80`,
    };
  }
}
