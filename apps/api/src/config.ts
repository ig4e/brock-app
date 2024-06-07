import pLimit from "p-limit";

export const config = {
  url: new URL(process.env.BASE_URL ?? "http://localhost:3000"),
  chatIDs: [
    -4197359680, -4134783529, -4243450395, -4223220764, -4241379367,
    -4267643195,
  ],
};

export const uploadLimit = pLimit(1);
export const internalUploadChunkLimit = pLimit(2);
