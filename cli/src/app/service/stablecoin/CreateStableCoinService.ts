import { configurationService, language } from './../../../index.js';
import { utilsService } from '../../../index.js';
import {
  CreateRequest,
  StableCoin,
  StableCoinViewModel,
  TokenSupplyType,
  RequestPrivateKey,
  RequestPublicKey,
  GetPublicKeyRequest,
  RequestAccount,
  Account,
} from 'hedera-stable-coin-sdk';
import { IManagedFeatures } from '../../../domain/configuration/interfaces/IManagedFeatures.js';
import Service from '../Service.js';
import SetConfigurationService from '../configuration/SetConfigurationService.js';

/**
 * Create Stable Coin Service
 */
export default class CreateStableCoinService extends Service {
  constructor() {
    super('Create Stable Coin');
  }

  /**
   * Create stable coin in hedera
   * @param stableCoin
   * @param isWizard
   */
  public async createStableCoin(
    stableCoin: CreateRequest,
    isWizard = false,
  ): Promise<StableCoinViewModel> {
    if (isWizard) {
      stableCoin = await this.wizardCreateStableCoin();
    }

    const currentAccount = utilsService.getCurrentAccount();

    if (
      currentAccount.privateKey == null ||
      currentAccount.privateKey == undefined ||
      currentAccount.privateKey.key == ''
    ) {
      const setConfigurationService: SetConfigurationService =
        new SetConfigurationService();
      await setConfigurationService.initConfiguration(
        configurationService.getDefaultConfigurationPath(),
        currentAccount.network,
      );
    }
    let createdToken;

    // Loading
    utilsService.showMessage('\n');
    await utilsService.showSpinner(
      new Promise((resolve, reject) => {
        StableCoin
          .create(stableCoin)
          .then((coin) => {
            console.log(coin);
            createdToken = coin;
            resolve(coin);
          })
          .catch((err) => {
            reject(err);
          });
      }),
      {
        text:
          language.getText('stablecoin.description') + ` ${stableCoin.name}...`,
        failText: 'Error',
        successText: language.getText('stablecoin.created', {
          name: stableCoin.name,
          symbol: stableCoin.symbol,
          decimals: stableCoin.decimals,
        }),
      },
    );
    return createdToken;
  }

  /**
   * Specific function for wizard to create stable coin
   * @returns
   */
  public async wizardCreateStableCoin(): Promise<CreateRequest> {
    const currentAccount = utilsService.getCurrentAccount();
    const currentFactory = utilsService.getCurrentFactory();
    const currentHederaERC20 = utilsService.getCurrentHederaERC20();

    utilsService.displayCurrentUserInfo(currentAccount);

    // Call to create stable coin sdk function
    let tokenToCreate = new CreateRequest({
      name: '',
      symbol: '',
      decimals: 6,
      stableCoinFactory: currentFactory.id,
      hederaERC20: currentHederaERC20.id,
    });

    // Name
    tokenToCreate.name = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askName'),
      tokenToCreate.name || 'HEDERACOIN',
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('name'),
      async () => {
        tokenToCreate.name = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askName'),
          tokenToCreate.name || 'HEDERACOIN',
        );
      },
    );

    // Symbol
    tokenToCreate.symbol = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askSymbol'),
      tokenToCreate.symbol || 'HDC',
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('symbol'),
      async () => {
        tokenToCreate.symbol = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askSymbol'),
          tokenToCreate.symbol || 'HDC',
        );
      },
    );

    // Auto renew account
    tokenToCreate.autoRenewAccount = await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askAutoRenewAccountId'),
      tokenToCreate.autoRenewAccount || currentAccount.accountId,
    );
    await utilsService.handleValidation(
      () => tokenToCreate.validate('autoRenewAccount'),
      async () => {
        tokenToCreate.autoRenewAccount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAutoRenewAccountId'),
          tokenToCreate.autoRenewAccount || currentAccount.accountId,
        );
      },
    );

    const optionalProps = await this.askForOptionalProps();
    let initialSupply = '';
    let supplyType = true;
    const totalSupply = undefined;

    if (optionalProps) {
      tokenToCreate.decimals = await this.askForDecimals(
        tokenToCreate.decimals.toString(),
      );
      await utilsService.handleValidation(
        () => tokenToCreate.validate('decimals'),
        async () => {
          tokenToCreate.decimals = await this.askForDecimals(
            tokenToCreate.decimals.toString(),
          );
        },
      );

      supplyType = await this.askForSupplyType();
      tokenToCreate.supplyType = supplyType
        ? TokenSupplyType.INFINITE
        : TokenSupplyType.FINITE;

      tokenToCreate.maxSupply = totalSupply;

      if (!supplyType) {
        tokenToCreate.maxSupply = await this.askForTotalSupply();
        await utilsService.handleValidation(
          () => tokenToCreate.validate('maxSupply'),
          async () => {
            tokenToCreate.maxSupply = await this.askForTotalSupply();
          },
        );
      }

      initialSupply = await this.askForInitialSupply(
        tokenToCreate.initialSupply?.toString(),
      );
      tokenToCreate.initialSupply = initialSupply;
      await utilsService.handleValidation(
        () => tokenToCreate.validate('initialSupply'),
        async () => {
          initialSupply = await this.askForInitialSupply(
            tokenToCreate.initialSupply?.toString(),
          );
          tokenToCreate.initialSupply = initialSupply;
        },
      );
    }

    const managedBySC = await this.askForManagedFeatures();
    console.log({
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      autoRenewAccount: tokenToCreate.autoRenewAccount,
      decimals: tokenToCreate.decimals,
      initialSupply:
        initialSupply === '' || !initialSupply ? undefined : initialSupply,
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: tokenToCreate.maxSupply
    });
    if (managedBySC) {
      tokenToCreate.adminKey = Account.NullPublicKey;
      tokenToCreate.freezeKey = Account.NullPublicKey;
      //KYCKey,
      tokenToCreate.wipeKey = Account.NullPublicKey;
      tokenToCreate.supplyKey = Account.NullPublicKey;
      tokenToCreate.pauseKey = Account.NullPublicKey;
      if (
        !(await utilsService.defaultConfirmAsk(
          language.getText('stablecoin.askConfirmCreation'),
          true,
        ))
      ) {
        await utilsService.cleanAndShowBanner();

        tokenToCreate = await this.wizardCreateStableCoin();
      }
      return tokenToCreate;
    }

    const { adminKey, supplyKey, freezeKey, wipeKey, pauseKey } =
      await this.configureManagedFeatures();

    tokenToCreate.adminKey = adminKey;
    tokenToCreate.supplyKey = supplyKey;
    //tokenToCreate.KYCKey = KYCKey;
    tokenToCreate.freezeKey = freezeKey;
    tokenToCreate.wipeKey = wipeKey;
    tokenToCreate.pauseKey = pauseKey;

    const treasury = this.getTreasuryAccountFromSupplyKey(supplyKey);
    tokenToCreate.treasury = treasury;

    console.log({
      name: tokenToCreate.name,
      symbol: tokenToCreate.symbol,
      autoRenewAccount: tokenToCreate.autoRenewAccount,
      decimals: tokenToCreate.decimals,
      initialSupply: initialSupply === '' ? undefined : initialSupply,
      supplyType: supplyType ? 'INFINITE' : 'FINITE',
      maxSupply: totalSupply ? BigInt(totalSupply) : totalSupply,
      freezeKey:
        freezeKey === undefined
          ? 'None'
          : freezeKey.key !== 'null'
          ? freezeKey
          : 'The Smart Contract',
      //KYCKey,
      wipeKey:
        wipeKey === undefined
          ? 'None'
          : wipeKey.key !== 'null'
          ? wipeKey
          : 'The Smart Contract',
      adminKey:
        adminKey === undefined
          ? 'None'
          : adminKey.key !== 'null'
          ? adminKey
          : 'The Smart Contract',
      supplyKey:
        supplyKey === undefined
          ? 'None'
          : supplyKey.key !== 'null'
          ? supplyKey
          : 'The Smart Contract',
      pauseKey:
        pauseKey === undefined
          ? 'None'
          : pauseKey.key !== 'null'
          ? pauseKey
          : 'The Smart Contract',
      treasury: treasury !== '0.0.0' ? treasury : 'The Smart Contract',
    });
    if (
      !(await utilsService.defaultConfirmAsk(
        language.getText('stablecoin.askConfirmCreation'),
        true,
      ))
    ) {
      await utilsService.cleanAndShowBanner();

      tokenToCreate = await this.wizardCreateStableCoin();
    }
    return tokenToCreate;
  }

  private async askForDecimals(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askDecimals'),
      val || '6',
    );
  }

  private async askForOptionalProps(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askOptionalProps'),
      true,
    );
  }

  private async askForInitialSupply(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askInitialSupply'),
      val || '0',
    );
  }

  private async askForSupplyType(val?: boolean): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askSupplyType'),
      val || true,
    );
  }

  private async askForTotalSupply(val?: string): Promise<string> {
    return await utilsService.defaultSingleAsk(
      language.getText('stablecoin.askTotalSupply'),
      val || '1',
    );
  }

  private async askForManagedFeatures(): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(
      language.getText('stablecoin.askFeaturesManagedBy'),
      true,
    );
  }

  private async configureManagedFeatures(): Promise<IManagedFeatures> {
    const adminKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.admin'),
        language.getArray('wizard.adminFeatureOptions'),
      ),
    );

    /*const KYCKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.KYC'),
        language.getArray('wizard.featureOptions'),
      ),
    );*/

    const freezeKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.freeze'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const wipeKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.wipe'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const pauseKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.pause'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    const supplyKey = await this.checkAnswer(
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.features.supply'),
        language.getArray('wizard.featureOptions'),
      ),
    );

    return { adminKey, supplyKey, freezeKey, wipeKey, pauseKey };
  }

  private async checkAnswer(answer: string): Promise<RequestPublicKey> {
    switch (answer) {
      case 'Current user key': {
        const currentAccount = utilsService.getCurrentAccount();
        const privateKey: RequestPrivateKey = ({
          key: currentAccount.privateKey.key,
          type: currentAccount.privateKey.type
      });
        const reqAccount: RequestAccount = ({
          accountId: currentAccount.accountId,
          privateKey: privateKey
        });
        const req: GetPublicKeyRequest= new GetPublicKeyRequest({
          account: reqAccount
        })
        return Account.getPublicKey(req)
      }

      case 'Other key': {
        const key = await utilsService.defaultPublicKeyAsk();
        return ({
          key: key,
          type: 'ED25519',
        });
      }

      case 'None':
        return undefined;

      case 'The Smart Contract':
      default:
        return Account.NullPublicKey;
    }
  }

  private getTreasuryAccountFromSupplyKey(supplyKey: RequestPublicKey): string {
    if (supplyKey && !Account.isPublicKeyNull(supplyKey)) {
      const currentAccount = utilsService.getCurrentAccount();
      return currentAccount.accountId;
    } else {
      return undefined;
    }
  }
}
