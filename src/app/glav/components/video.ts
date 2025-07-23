import { createReadStream } from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = join(
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "",
    "public",
    "video",
    "videoStart.mp4"
);

  res.setHeader("Content-Type", "video/mp4");

  createReadStream(filePath).pipe(res);
}
