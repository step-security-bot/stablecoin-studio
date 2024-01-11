import {
  AccountCreateTransaction,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  KeyList,
  AccountUpdateTransaction,
  AccountInfoQuery,
  PublicKey,
  Key,
  Transaction,
  Status,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

// Configure the environment variables
dotenv.config();

// Testnet account ID and private key
const MY_PRIVATE_KEY = undefined || process.env.MY_PRIVATE_KEY;
const MY_ACCOUNT_ID = undefined || process.env.MY_ACCOUNT_ID;
const MY_ACCOUNT_EVM_ID = undefined || process.env.MY_ACCOUNT_EVM_ID;

/**
 * Executes the main logic of the program.
 * This function creates a new account, generates private and public keys,
 * changes the associated keys of the account, and prints the updated account info.
 */
async function main() {
  let client = Client.forTestnet();

  const { privateKey, accountId, evmAccountId } = ensureConstantsAreProvided();

  const defaultPrivKey = PrivateKey.fromStringDer(privateKey);
  const defaultPubKey = defaultPrivKey.publicKey;
  const defaultAccount = AccountId.fromString(accountId);
  const defaultEvmAccount = evmAccountId;

  // Set the client operator as the default account (like Signer in Ethers)
  client = client.setOperator(defaultAccount, defaultPrivKey);

  const newAccountId = await createNewAccount(client, defaultPubKey, new Hbar(1));

  // Generate 3 private keys
  const privateKeys = await Promise.all([
    PrivateKey.generateED25519Async(),
    PrivateKey.generateED25519Async(),
    PrivateKey.generateED25519Async(),
  ]);
  const publicKeys = privateKeys.map((key) => key.publicKey);

  const result = await changeAccountAssociatedKeys(
    client,
    newAccountId,
    [defaultPrivKey],
    privateKeys,
    publicKeys,
    2
  );
  if (result != newAccountId) {
    throw new Error("Account update failed");
  }

  // Create the account info query
  const query = new AccountInfoQuery().setAccountId(newAccountId);
  // Sign with client operator private key and submit the query to a Hedera network
  const newKeys = (await query.execute(client)).key;

  //Print the account info to the console
  console.log(newKeys);
  console.log("\x1b[32mSUCCESS!!\x1b[0m");
}

/**
 * Ensures that the required constants are provided as environment variables.
 * @returns An object containing the required constants.
 * @throws {Error} If any of the required constants are missing.
 */
function ensureConstantsAreProvided() {
  const errorList: string[] = [];
  if (!MY_PRIVATE_KEY) {
    errorList.push("MY_PRIVATE_KEY must be set");
  }
  if (!MY_ACCOUNT_ID) {
    errorList.push("MY_ACCOUNT_ID must be set");
  }
  if (!MY_ACCOUNT_EVM_ID) {
    errorList.push("MY_ACCOUNT_EVM_ID must be set");
  }
  if (errorList.length > 0) {
    throw new Error(`Missing environment variables:\n${errorList.join("\n")}`);
  }
  return {
    privateKey: MY_PRIVATE_KEY!,
    accountId: MY_ACCOUNT_ID!,
    evmAccountId: MY_ACCOUNT_EVM_ID!,
  };
}

/**
 * Creates a new account on the Hedera network.
 *
 * @param client - The Hedera client instance.
 * @param publicKey - The public key associated with the new account.
 * @param initBalance - The initial balance of the new account (optional).
 * @returns A promise that resolves to the account ID of the newly created account.
 * @throws An error if the account creation fails or the transaction receipt has a null account ID.
 */
async function createNewAccount(
  client: Client,
  publicKey: Key,
  initBalance?: Hbar | number
): Promise<AccountId> {
  // Create the transaction
  const newAccountTx = new AccountCreateTransaction()
    .setKey(publicKey)
    .setInitialBalance(initBalance);

  // Sign the transaction with the client operator private key and submit to a Hedera network
  const newAccountTxResponse = await newAccountTx.execute(client);

  // Request the receipt of the transaction
  const newAccountTxReceipt = await newAccountTxResponse.getReceipt(client);

  // Get the account ID
  const newAccountId = newAccountTxReceipt.accountId;
  if (newAccountId == null) {
    throw new Error("Account not created. Transaction receipt has null account ID");
  }

  return newAccountId;
}

/**
 * Changes the associated keys of an account.
 * 
 * @param client - The Hedera client.
 * @param accountId - The ID of the account to update.
 * @param oldPrivateKeys - The old private keys associated with the account.
 * @param newPrivateKeys - The new private keys to associate with the account.
 * @param newPublicKeys - The new public keys to associate with the account.
 * @param threshold - The threshold for multi-key structure (optional).
 * @returns The updated account ID.
 * @throws Error if the account update fails.
 */
async function changeAccountAssociatedKeys(
  client: Client,
  accountId: AccountId,
  oldPrivateKeys: PrivateKey[],
  newPrivateKeys: PrivateKey[],
  newPublicKeys: PublicKey[],
  threshold?: number
): Promise<AccountId> {
  let associatedKey: Key;
  if (newPublicKeys.length > 1) {
    // Create multi key structure
    associatedKey = new KeyList(newPublicKeys, threshold);
  } else {
    associatedKey = newPublicKeys[0];
  }

  // Create the transaction
  const updateTx = new AccountUpdateTransaction()
    .setAccountId(accountId)
    .setKey(associatedKey)
    .freezeWith(client);

  let finalSignedTx: Transaction = updateTx;
  // Sign the transaction with the old private keys
  for await (const key of oldPrivateKeys) {
    finalSignedTx = await finalSignedTx.sign(key);
  }
  // Sign the transaction with the new private keys
  for await (const key of newPrivateKeys) {
    finalSignedTx = await finalSignedTx.sign(key);
  }

  // Sign the transaction with the client operator private key and submit to a Hedera network
  const updateTxResponse = await finalSignedTx.execute(client);

  // Request the receipt of the transaction
  const updateTxReceipt = await updateTxResponse.getReceipt(client);

  // Check the transaction consensus status
  if (updateTxReceipt.status !== Status.Success) {
    throw new Error("Account update failed");
  }
  return accountId;
}

main();
