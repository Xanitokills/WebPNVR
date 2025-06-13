import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Mock file upload (replace with S3 or Cloudinary integration)
  const formData = await request.formData();
  const files = formData.getAll("files");
  return NextResponse.json({ message: "Archivos subidos", files: files.map((f: any) => f.name) });
}