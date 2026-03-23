# AWS Deployment Guide

This guide covers two main ways to deploy your Next.js application to AWS.

## Option 1: AWS Amplify Hosting (Recommended)

This is the easiest way to deploy Next.js apps with SSR support.

1.  **Push your code** to a Git repository (GitHub, Bitbucket, GitLab, or AWS CodeCommit).
2.  Go to the **AWS Amplify Console**.
3.  Click **"Deploy an app"** and connect your repository.
4.  Amplify will automatically detect Next.js.
5.  **Environment Variables**: In the Amplify console, go to "Environment variables" and add your `DATABASE_URL`.
6.  **Build Settings**: Ensure the build command includes `npx prisma generate && next build`.

## Option 2: AWS App Runner (Containerized)

Best if you want to use the provided `Dockerfile`.

1.  **Push your Image to ECR**:
    ```bash
    aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
    docker build -t nextjs-test-app .
    docker tag nextjs-test-app:latest your-account-id.dkr.ecr.your-region.amazonaws.com/nextjs-test-app:latest
    docker push your-account-id.dkr.ecr.your-region.amazonaws.com/nextjs-test-app:latest
    ```
2.  Go to **AWS App Runner Console**.
3.  Choose **"Service"** -> **"Container image"**.
4.  Select your ECR image.
5.  Configure **Environment Variables** (add `DATABASE_URL`).
6.  Set the port to `3000`.

## Database Setup (PostgreSQL)

For both options, you need a PostgreSQL database. You can use:
- **AWS RDS (Relational Database Service)**: The managed SQL service.
- **Neon / Supabase**: External serverless Postgres providers (very easy to set up).

Ensure your `DATABASE_URL` is accessible from the AWS environment.
