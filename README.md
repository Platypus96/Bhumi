# Bhumi: Decentralized Land Registry

Bhumi is a modern, full-stack web application that provides a decentralized solution for land and property registration. It leverages the power of the Ethereum blockchain for immutable transaction records, IPFS for decentralized document storage, and Firebase for scalable backend services.

The platform ensures transparency, security, and efficiency in managing property ownership, transfers, and verification. It features distinct roles for users and a central registrar, creating a trustworthy digital ecosystem for real estate.

## Key Features

- **Wallet Integration**: Seamlessly connect with MetaMask to interact with the application and the Ethereum blockchain.
- **Decentralized Document Storage**: All property images and legal documents are uploaded to IPFS via Pinata, ensuring their integrity and perpetual availability.
- **AI-Powered Descriptions**: Users can leverage Google's Gemini AI to automatically improve and professionalize property descriptions, making listings more appealing.
- **Property Registration & Management**: Authenticated users can register new properties, which are recorded on the blockchain and stored in Firestore.
- **Registrar Verification**: A designated registrar has a special dashboard to review and officially verify new property listings on the blockchain.
- **Marketplace**: Verified properties can be listed for sale. Users can browse the marketplace and purchase properties directly, with the transaction handled by a smart contract.
- **Ownership History**: All property transfers are recorded on-chain, providing a transparent and tamper-proof history of ownership for each asset.
- **Public Verification Portal**: Anyone can use a unique Parcel ID to look up a property and verify its details and document authenticity against the blockchain record.

## Technology Stack

- **Framework**: Next.js 15 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components for a modern and responsive UI.
- **Blockchain**: Ethereum (interacting via Ethers.js)
- **Decentralized Storage**: IPFS (through Pinata for pinning)
- **Backend & Database**: Firebase (Firestore for off-chain data and Auth for user management)
- **Generative AI**: Genkit with Google's Gemini model for description enhancement.

## Getting Started

To get the project running locally, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- A web browser with the [MetaMask](https://metamask.io/) extension installed.
- A Firebase project with Firestore enabled.
- API keys from [Pinata](https://www.pinata.cloud/) for IPFS uploads.

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

Create a `.env` file in the root of the project by copying the example:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required values:

```
# Address of the Ethereum account designated as the registrar
NEXT_PUBLIC_REGISTRAR_ADDRESS="0xYourRegistrarWalletAddress"

# Address of the deployed LandRegistry smart contract
NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourContractAddress"

# Your Pinata API keys for uploading files to IPFS
PINATA_API_KEY="YourPinataAPIKey"
PINATA_API_SECRET="YourPinataSecretAPIKey"
```

**Note**: You will also need to have your Firebase project configuration available in `src/firebase/config.ts`.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### 5. Set up MetaMask

- Open MetaMask and connect to your local development network (e.g., Hardhat, Ganache) or a testnet (e.g., Sepolia).
- Make sure you have some test ETH in your account to pay for gas fees.
- To use the registrar features, connect with the wallet address you specified in `NEXT_PUBLIC_REGISTRAR_ADDRESS`.
