# **App Name**: Bhumi

## Core Features:

- MetaMask Connection: Allow users to connect to the DApp using their MetaMask wallet and authenticate via their Ethereum address.
- Registrar Property Registration: Enable the registrar to register new properties by uploading property documents, storing the IPFS CID and SHA-256 hash on the blockchain, and saving property details in Firestore.
- Property Transfer Initiation: Allow current property owners to initiate property transfers by entering the buyer's wallet address and calling the `initiateTransfer` function. Records updated to Firestore.
- Registrar Transfer Approval: Enable the registrar to approve pending property transfers by calling the `approveTransfer` function and updating Firestore with transfer event history.
- Public Property Verification: Allow anyone to search for properties, fetch details from the blockchain and IPFS, and verify document integrity by comparing on-chain and recomputed SHA-256 hashes.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A), reflecting trust and security in land registry.
- Background color: Light gray (#F9FAFB), providing a clean and professional backdrop.
- Accent color: Soft teal (#2DD4BF), used sparingly for interactive elements to guide the user.
- Body and headline font: 'Inter', a versatile sans-serif providing a modern, neutral, and readable experience.
- Use simple, consistent icons from a library like FontAwesome or Material Icons to represent actions and data.
- Implement a responsive layout using MUI or TailwindCSS, ensuring accessibility across devices and screen sizes.
- Incorporate subtle animations, like loading spinners and feedback transitions, to enhance user experience without distraction.