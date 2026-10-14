import { NextResponse } from "next/server";
import { uploadSchema } from "@/lib/validators";
import { generatePresignedUploadUrl, uploadBufferToR2 } from "@/lib/r2";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Direct Multipart Form Data Upload (Single-step R2 storage)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { success: false, error: "No image file provided in form data." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = file.name || "craft_image.jpg";
      const fileType = file.type || "image/jpeg";

      const r2Res = await uploadBufferToR2(buffer, fileName, fileType);
      return NextResponse.json({
        success: true,
        message: "Image uploaded to Cloudflare R2 successfully",
        ...r2Res,
      });
    }

    // 2. Presigned URL Generation for Client-Side Direct S3 Upload
    const body = await request.json();
    const validation = uploadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { fileName, fileType } = validation.data;
    const r2Data = await generatePresignedUploadUrl(fileName, fileType);

    return NextResponse.json({
      success: true,
      message: "Presigned R2 upload URL generated",
      ...r2Data,
    });
  } catch (err) {
    console.error("Upload API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
