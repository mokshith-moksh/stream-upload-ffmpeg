Video Transcoding to DASH Format
This repository focuses on transcoding videos into DASH format. The videos are stored in S3 or Cloudflare R2 buckets, and the transcoded chunks are uploaded back to S3/R2 without using local storage.

Key Features
Transcoding to DASH: Converts videos to the DASH (Dynamic Adaptive Streaming over HTTP) format, ensuring efficient and high-quality streaming.
Direct Streaming: Streams video chunks directly from and to S3/R2, avoiding local storage to optimize performance and resource usage.
FFmpeg Integration: Utilizes FFmpeg for robust and versatile video processing.
Scalable and Efficient: Suitable for applications requiring high scalability and minimal storage footprint on the processing server.
