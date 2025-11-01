// TODO: Replace with your actual contract address and ABI

export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export const CONTRACT_ABI = [
  // A minimal ABI based on the user request.
  // Populate with your full contract ABI.
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "propertyId",
        "type": "string"
      }
    ],
    "name": "approveTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "propertyId",
        "type": "string"
      }
    ],
    "name": "getProperty",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "docHash",
            "type": "bytes32"
          },
          {
            "internalType": "enum LandRegistry.Status",
            "name": "status",
            "type": "uint8"
          }
        ],
        "internalType": "struct LandRegistry.Property",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "propertyId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      }
    ],
    "name": "initiateTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "parcelId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "hash",
        "type": "bytes32"
      }
    ],
    "name": "registerProperty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
