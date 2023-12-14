/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { SignatureRequest } from '../../models/signature/SignatureRequest';
import { ISignatureStrategy } from './ISignatureStrategy';
import {
  FireblocksSDK,
  PeerType,
  TransactionOperation,
  TransactionStatus,
} from 'fireblocks-sdk';
import { FireblocksConfig } from '../config/FireblocksConfig';
import { hexStringToUint8Array } from '../../utils/utilities';

export class FireblocksStrategy implements ISignatureStrategy {
  private fireblocks: FireblocksSDK;
  private config: FireblocksConfig;

  constructor(private strategyConfig: FireblocksConfig) {
    this.fireblocks = new FireblocksSDK(
      strategyConfig.apiSecretKey,
      strategyConfig.apiKey,
      strategyConfig.baseUrl,
    );
    this.config = strategyConfig;
  }

  async sign(request: SignatureRequest): Promise<Uint8Array> {
    const serializedTransaction = Buffer.from(
      request.getTransactionBytes(),
    ).toString('hex');
    const signatureHex = await this.signArbitraryMessage(
      this.config.vaultAccountId,
      serializedTransaction,
    );
    return hexStringToUint8Array(signatureHex);
  }

  private async signArbitraryMessage(
    vaultAccountId: string,
    message: string,
  ): Promise<string> {
    const { status, id } = await this.fireblocks.createTransaction({
      operation: TransactionOperation.RAW,
      assetId: 'HBAR_TEST',
      source: {
        type: PeerType.VAULT_ACCOUNT,
        id: vaultAccountId,
      },
      extraParameters: {
        rawMessageData: {
          messages: [
            {
              content: message,
            },
          ],
        },
      },
    });

    let currentStatus = status;
    let txInfo: any;

    do {
      try {
        console.log('keep polling for tx ' + id + '; status: ' + currentStatus);
        txInfo = await this.fireblocks.getTransactionById(id);
        currentStatus = txInfo.status;
      } catch (err) {
        console.log('err', err);
      }
      await new Promise((r) => setTimeout(r, 1000));
    } while (
      currentStatus != TransactionStatus.COMPLETED &&
      currentStatus != TransactionStatus.FAILED
    );

    const signature = txInfo.signedMessages[0].signature;
    return signature.fullSig;
  }
}
