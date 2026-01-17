# Bhumi: Decentralized Land Registry

Bhumi is a modern, full-stack web application that provides a decentralized solution for land and property registration. It leverages the power of the Ethereum blockchain for immutable transaction records, IPFS for decentralized document storage, and Firebase for scalable backend services.

The platform ensures transparency, security, and efficiency in managing property ownership, transfers, and verification. It features distinct roles for users and a central registrar, creating a trustworthy digital ecosystem for real estate.

## Key Features

- **Wallet Integration**: Seamlessly connect with MetaMask to interact with the application and the Ethereum blockchain.
- **Decentralized Document Storage**: All property images and legal documents are uploaded to IPFS via Pinata, ensuring their integrity and perpetual availability.
- **AI-Powered Descriptions**: Users can leverage Google's Gemini AI to automatically improve and professionalize property descriptions, making listings more appealing.
- **Interactive Property Mapping**: Users can draw their property's boundary on an interactive map using Leaflet. The area is calculated automatically, and the location can be found via geocoding.
- **Property Registration & Management**: Authenticated users can register new properties, which are recorded on the blockchain and stored in Firestore. They can manage their properties through a dedicated dashboard, filtering by verification status.
- **Registrar Verification Workflow**: A designated registrar has a special dashboard to review and officially verify new property listings on the blockchain. The registrar can approve a property or reject it with a specific reason, which is then communicated back to the owner.
- **Marketplace**: Verified properties can be listed for sale. Owners can set a price in ETH, and other users can browse and search the marketplace by location, title, parcel ID, or owner address.
- **On-Chain Purchase**: Users can purchase properties directly through the platform. The transaction is handled by a smart contract, which securely transfers ownership and funds.
- **Ownership History & Integrity Check**: All property transfers are recorded on-chain, providing a transparent and tamper-proof history of ownership. The platform also allows for on-demand verification of document authenticity against the blockchain record.
- **Public Verification Portal**: Anyone can use a search portal to look up a property by its Parcel ID, location, owner name, or wallet address to verify its details and document authenticity.
- **Role-Based Access**: The application has clear roles for a general user and a registrar, with UI and functionality tailored to each.

## Technology Stack

- **Framework**: Next.js 15 (with App Router)
- **Deployment**: Vercel
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components for a modern and responsive UI.
- **Blockchain**: Ethereum (interacting via Ethers.js)
- **Decentralized Storage**: IPFS (through Pinata for pinning)
- **Mapping**: Leaflet, Leaflet-draw, and Turf.js
- **Backend & Database**: Firebase (Firestore for off-chain data and Auth for user management)
- **Generative AI**: Genkit with Google's Gemini model for description enhancement.

## Getting Started

To get the project running locally, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- A web browser with the [MetaMask](https://metamask.io/) extension installed.
- A Firebase project with Firestore enabled.
- API keys from [Pinata](https://www.pinata.cloud/) for IPFS uploads.
- A Google AI Gemini API key.
- A Google Maps API Key for geocoding functionality.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a file named `.env` in the root of your project and add the following variables. This is required for both local development and for deployment on services like Vercel.

```env
# Firebase Configuration
# You can get these values from your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Blockchain Configuration
# Address of the Ethereum account designated as the registrar
NEXT_PUBLIC_REGISTRAR_ADDRESS="0xYourRegistrarWalletAddress"
# Address of the deployed LandRegistry smart contract
NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourContractAddress"

# IPFS Service (Pinata)
# Your Pinata API keys for uploading files to IPFS
PINATA_API_KEY="YourPinataAPIKey"
PINATA_API_SECRET="YourPinataSecretAPIKey"

# Google AI (Gemini)
# Your Gemini API Key from Google AI Studio
GEMINI_API_KEY="YourGeminiAPIKey"

# Google Maps (for Geocoding API)
# Your Google Maps API key with Geocoding API enabled
GOOGLE_MAPS_API_KEY="YourGoogleMapsAPIKey"
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### 5. Deploying to Vercel

When you deploy to Vercel, make sure to add all the environment variables from your `.env` file to your Vercel project's settings.

### 6. Set up MetaMask

- Open MetaMask and connect to your local development network (e.g., Hardhat, Ganache) or a testnet (e.g., Sepolia).
- Make sure you have some test ETH in your account to pay for gas fees.
- To use the registrar features, connect with the wallet address you specified in `NEXT_PUBLIC_REGISTRAR_ADDRESS`.
