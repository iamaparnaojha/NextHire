# Deploying NextHire to AWS App Runner

AWS App Runner provides a fast, secure, and fully managed way to deploy containerized web applications directly from a container registry or source repository.

Given that NextHire uses a Docker container wrapping both the FastAPI backend and static frontend, AWS App Runner is a perfect fit.

## Prerequisites

1.  **AWS Account**: An active AWS account.
2.  **AWS CLI**: Installed and configured locally.
3.  **Docker**: Installed locally to build and test the image.
4.  **MongoDB Atlas**: A cloud-hosted MongoDB cluster (App Runner instances are stateless).
5.  **Gemini API Key**: Your Google Gemini API token.

## Step 1: Push the Docker Image to ECR (Elastic Container Registry)

AWS App Runner can pull directly from ECR.

1.  **Create an ECR Repository**:
    Navigate to the AWS Console -> ECR and create a new private repository named `nexthire`.

2.  **Login to your Amazon ECR registry**:
    ```bash
    aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-region>.amazonaws.com
    ```

3.  **Build the Docker Image**:
    In the root of the `NextHire` repository, run:
    ```bash
    docker build -t nexthire .
    ```

4.  **Tag and Push**:
    ```bash
    docker tag nexthire:latest <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/nexthire:latest
    docker push <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/nexthire:latest
    ```

## Step 2: Configure AWS App Runner

1.  Navigate to **AWS App Runner** in the AWS Console.
2.  Click **Create an App Runner service**.
3.  **Source**: Select **Container registry**.
    *   Provider: Amazon ECR.
    *   Container image URI: Select the image you pushed in Step 1.
    *   Deployment settings: Choose **Manual** or **Automatic** (requires ECR access role).
4.  **Service settings**:
    *   Service name: `nexthire-prod`
    *   Virtual CPU & Memory: `1 vCPU / 2 GB` (or higher if doing heavy local PDF parsing).
    *   **Port**: `8000` (Crucial - this matches our Uvicorn setup inside the Dockerfile).
5.  **Environment Variables**: You MUST set the following for the app to work in production:
    *   `GEMINI_API_KEY`: <Your Key>
    *   `JWT_SECRET`: <A strong random string>
    *   `MONGODB_URI`: <Your MongoDB Atlas connection string (ensure it allows access from AWS/Anywhere)>
    *   `MONGODB_DB_NAME`: `nexthire`
    *   `HOST`: `0.0.0.0`
    *   `PORT`: `8000`
    *   `CORS_ORIGINS`: `*` (or lock it down perfectly to the deployed App Runner URL).
6.  **Review & Create**: Wait approx. 5 minutes for the infrastructure to provision and the container to spin up.

## Step 3: Access your App

Once the deployment completes, AWS App Runner will provide a default domain (e.g., `https://randomchars.region.awsapprunner.com`). 

Open this URL in your browser to access the fully functional NextHire platform.

### Troubleshooting

*   **Database Connectivity Issues**: If login or saving history fails, your MongoDB Atlas network access list might be blocking the AWS App Runner IPs. Set the Network Access in Atlas to `0.0.0.0/0` (allow all) or properly peer your AWS VPC with MongoDB Atlas.
*   **Resume Upload Errors**: App Runner instances scale to zero and are ephemeral. File uploads to `/app/uploads` are lost on restart. This is perfectly fine for our transient PDF processing, as no long-term file storage is currently implemented!
