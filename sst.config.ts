/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "learning-tracker",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Load environment variables from .env file
    // SST automatically loads .env file, access via process.env
    const llmProvider = process.env.LLM_PROVIDER || "deepseek";
    const llmBaseUrl = process.env.LLM_BASE_URL || "";
    const llmModel = process.env.LLM_MODEL || "deepseek-chat";
    const llmApiKey = process.env.LLM_API_KEY || "";
    const s3BucketName = process.env.S3_BUCKET_NAME || "";
    const s3DataKey = process.env.S3_DATA_KEY || "learning-items.json";

    // Deploy Next.js app
    const site = new sst.aws.Nextjs("LearningTracker", {
      path: ".",
      environment: {
        LLM_PROVIDER: llmProvider,
        LLM_BASE_URL: llmBaseUrl,
        LLM_MODEL: llmModel,
        LLM_API_KEY: llmApiKey,
        S3_BUCKET_NAME: s3BucketName,
        S3_DATA_KEY: s3DataKey,
        // Note: AWS_REGION is automatically set by Lambda (reserved variable)
        // AWS credentials are handled via IAM roles in Lambda
        // No need to set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
      },
      transform: {
        server: {
          memory: "1024 MB",
          timeout: "30 seconds",
        },
        cdn: {
          // Ensure CloudFront allows public access
        },
      },
      // Grant S3 permissions to Lambda functions
      permissions: s3BucketName
        ? [
            {
              actions: ["s3:GetObject", "s3:PutObject"],
              resources: [`arn:aws:s3:::${s3BucketName}/*`],
            },
          ]
        : [],
    });

    return {
      url: site.url,
    };
  },
});

