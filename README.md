# Brock App

## Introduction

Brock App is a modern, full-stack application built with an Expo app for the frontend and a Node.js API for the backend. The Expo app provides a user-friendly interface for end-users, while the API handles data processing and serves as the backend logic of the application.

## Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
5. [Deploying to Koyeb](#deploying-to-koyeb)
6. [Project Structure](#project-structure)
7. [Contributing](#contributing)
8. [License](#license)

## Tech Stack

- **Frontend**: Expo (React Native)
- **Backend**: Node.js, Express
- **Database**: Prisma
- **Hosting**: Koyeb

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your local machine
- An Expo account and the Expo CLI installed
- A Koyeb account
- (Specify other prerequisites if needed)

## Setup Instructions

1. **Clone the repository**:

    ```sh
    git clone <repository-url>
    cd brock-app-master
    ```

2. **Install dependencies**:

    ```sh
    npm install
    ```

3. **Set up environment variables**:

    Copy the `.env.example` file to `.env` and fill in the required variables.

    ```sh
    cp .env.example .env
    ```

4. **Run the API**:

    ```sh
    cd apps/api
    npm start
    ```

5. **Run the Expo app**:

    Open a new terminal window and navigate to the project root.

    ```sh
    cd apps/expo
    expo start
    ```

## Deploying to Koyeb

1. **Sign in to your Koyeb account**.

2. **Create a new app**:

    - Click on "Create App".
    - Choose "GitHub" as the source and select the repository.

3. **Configure build settings**:

    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`

4. **Set environment variables**:

    Add the environment variables from your `.env` file in the Koyeb dashboard.

5. **Deploy the app**:

    Click on "Deploy" to start the deployment process. Once the deployment is complete, your app will be live.

## Project Structure

The project is organized into the following directories:

- **apps**: Contains the main applications (API and Expo).
  - `api`: The backend API built with Node.js and Express.
  - `expo`: The frontend mobile application built with Expo.
- **packages**: Shared packages and modules used by the applications.
- **tooling**: Configuration and scripts for development and deployment.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
