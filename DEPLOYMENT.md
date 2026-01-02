# AWS Lambda Deployment Guide

This guide covers deploying the Next.js application to AWS Lambda using SST (Serverless Stack).

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```
3. **Node.js 20.x** installed
4. **SST CLI** installed globally
   ```bash
   npm install -g sst
   ```

## Deployment with SST

SST (Serverless Stack) is a modern TypeScript-first framework built on AWS CDK, specifically designed for Next.js and serverless applications.

### Installation

1. Install SST dependencies (already in `package.json`):
   ```bash
   npm install
   ```

2. Link your SST app (first time only):
   ```bash
   sst link
   ```

### Configuration

1. **Environment Variables**: SST automatically reads from `.env` file. Make sure `.env` file contains:

   ```bash
   # LLM Configuration
   LLM_PROVIDER=deepseek
   LLM_BASE_URL=https://api.deepseek.com
   LLM_MODEL=deepseek-chat
   LLM_API_KEY=api-key-here
   
   # AWS S3 Configuration
   S3_BUCKET_NAME=data-bucket-name
   S3_DATA_KEY=learning-items.json
   AWS_REGION=eu-west-2
   ```

   **Note:** For production, SST uses IAM roles for AWS credentials (more secure than access keys). The Lambda execution role will automatically have permissions to access S3.

2. **SST Configuration**: The `sst.config.ts` file is already configured with:
   - Next.js app deployment
   - Environment variables from `.env`
   - Lambda memory (1024 MB) and timeout (30 seconds)
   - Optional S3 bucket creation

### Development vs Deployment - When to Use Each

**`npm run dev:sst` (sst dev)** - Active development mode:
- Watches for file changes and hot-reloads automatically
- Provides a local development URL that proxies to AWS
- Automatically redeploys on every code change
- Designed for active coding/development
- Resources are cleaned up on exit (for dev stages)
- **Use when:** You're actively coding and want instant feedback on changes

**`npm run deploy` (sst deploy)** - One-time deployment to dev/staging:
- One-time deployment (no file watching)
- No hot-reloading
- Resources are retained until you remove them
- **Use when:** You want to test a specific version in a stable dev environment

**`npm run deploy:prod` (sst deploy --stage production)** - Production deployment:
- One-time deployment to production
- Resources are permanently retained (protected from deletion)
- **Use when:** Deploying to your live production site

### Typical Workflow

1. **While coding:** Use `npm run dev:sst` - changes deploy automatically as you code
2. **Testing a version:** Use `npm run deploy` - deploy once to dev/staging for testing
3. **Going live:** Use `npm run deploy:prod` - deploy to production

### Development

Run SST dev mode for active development with live AWS resources:

```bash
npm run dev:sst
```

This starts a local development server connected to AWS resources. It watches for changes and automatically redeploys.

**Important:** press `Ctrl+C` to stop `sst dev`:
- SST will attempt to automatically clean up the deployed resources
- Wait a few seconds for cleanup to complete before closing the terminal
- If cleanup is interrupted, resources may remain in AWS
- To manually clean up: `npm run remove` (removes dev stage resources)
- Production resources are retained (configured in `sst.config.ts`)

### Deployment

SST supports multiple deployment stages (environments). You can have both dev and production running simultaneously.

**Note:** `sst deploy` automatically builds your Next.js app as part of the deployment process. You don't need to run `npm run build:sst` separately.

1. **Deploy to dev/staging stage** (default):
   ```bash
   npm run deploy
   ```
   - Uses default stage (typically "dev")
   - Automatically builds Next.js app
   - Resources can be removed with `npm run remove`
   - Good for testing before production

2. **Deploy to production stage**:
   ```bash
   npm run deploy:prod
   ```
   - Uses "production" stage
   - Automatically builds Next.js app
   - Resources are retained (won't be deleted)
   - Use for your live site

3. After deployment, SST will output:
   - Your application URL (CloudFront distribution)
   - S3 bucket name (if created)
   - Other resource information

**When to use `npm run build:sst`:**
- Only if you want to build without deploying (rare)
- Useful for debugging build issues
- Not needed before `npm run deploy:prod` - deployment handles it automatically

**Note:** 
- Each stage deploys to separate AWS resources (separate URLs, separate Lambda functions)
- Production resources are protected from accidental deletion (configured in `sst.config.ts`)
- Use `sst deploy` for production deployments - it's more cost-effective than `sst dev` since it doesn't constantly redeploy on file changes

### Post-Deployment

After deployment, you'll receive:
- CloudFront distribution URL (your app URL)
- Lambda function ARNs
- S3 bucket name (if created by SST)

## Important Considerations

### S3 Storage

Your app uses S3 for data storage. SST can create the bucket for you, or you can use an existing bucket:

1. **Using existing bucket**: Set `S3_BUCKET_NAME` in your `.env` file
2. **SST-created bucket**: Leave `S3_BUCKET_NAME` empty or unset, and SST will create one
3. **IAM Permissions**: SST automatically configures IAM roles with S3 permissions for Lambda

### Environment Variables

SST automatically passes environment variables from your `.env` file to the Lambda functions. Required variables:

**LLM Configuration:**
- `LLM_PROVIDER` - LLM provider (e.g., "deepseek", "ollama")
- `LLM_BASE_URL` - LLM API base URL
- `LLM_MODEL` - Model name
- `LLM_API_KEY` - API key for the LLM provider

**AWS S3 Configuration:**
- `S3_BUCKET_NAME` - Your S3 bucket name (optional if SST creates it)
- `S3_DATA_KEY` - S3 object key (default: `learning-items.json`)
- `AWS_REGION` - AWS region (default: `us-east-1`)

**Note:** AWS credentials are handled via IAM roles in Lambda (more secure). No need to set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in production.

### Lambda Configuration

Current settings in `sst.config.ts`:
- **Memory**: 1024 MB
- **Timeout**: 30 seconds
- **Package size**: Handled automatically by SST

You can adjust these in `sst.config.ts` if needed.

## Troubleshooting

### Build Errors

If you encounter build errors:
```bash
rm -rf .next node_modules .sst
npm install
npm run build
```

### SST Link Issues

If you need to re-link your SST app:
```bash
sst unlink
sst link
```

### Lambda Timeout

If Lambda times out:
1. Increase timeout in `sst.config.ts` (in the `transform.server.timeout` field)
2. Optimize API routes
3. Check CloudWatch logs for performance issues

### Environment Variables Not Working

SST automatically loads from `.env`. If variables aren't working:
1. Check that `.env` file exists in the project root
2. Verify variable names match exactly (case-sensitive)
3. Restart SST dev server or redeploy

### S3 Access Issues

If Lambda can't access S3:
1. Check that the bucket exists (or let SST create it)
2. Verify IAM role permissions (SST should handle this automatically)
3. Check CloudWatch logs for specific error messages

## Alternative Deployment Options

### AWS Amplify

AWS Amplify is another option for deploying Next.js to AWS:

1. Install AWS Amplify CLI:
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. Initialize Amplify:
   ```bash
   amplify init
   amplify add hosting
   amplify publish
   ```

## Resources

- [SST Documentation](https://docs.sst.dev/)
- [SST Next.js Guide](https://docs.sst.dev/nextjs/)
- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
