import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import Big from 'big.js';
import {
  language,
  utilsService,
  wizardService,
  configurationService,
} from '../../../index.js';
import Service from '../Service.js';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import {
  RequestAccount,
  StableCoinRole,
  BurnRequest,
  GetAccountBalanceRequest,
  GetRolesRequest,
  FreezeAccountRequest,
  KYCRequest,
  StableCoinCapabilities,
  Access,
  Operation,
  RequestPrivateKey,
  CashInRequest,
  WipeRequest,
  RescueRequest,
  IncreaseSupplierAllowanceRequest,
  CheckSupplierLimitRequest,
  DecreaseSupplierAllowanceRequest,
  ResetSupplierAllowanceRequest,
  PauseRequest,
  DeleteRequest,
  GetSupplierAllowanceRequest,
  AddFixedFeeRequest,
  AddFractionalFeeRequest,
  RequestCustomFee,
  UpdateCustomFeesRequest,
  HBAR_DECIMALS,
  GrantMultiRolesRequest,
  MAX_ACCOUNTS_ROLES,
  TRANSFER_LIST_SIZE,
  RevokeMultiRolesRequest,
  TransfersRequest,
} from 'hedera-stable-coin-sdk';
import BalanceOfStableCoinsService from './BalanceOfStableCoinService.js';
import CashInStableCoinsService from './CashInStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import RoleStableCoinsService from './RoleStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';
import BurnStableCoinsService from './BurnStableCoinService.js';
import DeleteStableCoinService from './DeleteStableCoinService.js';
import PauseStableCoinService from './PauseStableCoinService.js';
import ManageImportedTokenService from './ManageImportedTokenService';
import FreezeStableCoinService from './FreezeStableCoinService.js';
import KYCStableCoinService from './KYCStableCoinService.js';
import ListStableCoinsService from './ListStableCoinsService.js';
import CapabilitiesStableCoinService from './CapabilitiesStableCoinService.js';
import FeeStableCoinService from './FeeStableCoinService.js';
import TransfersStableCoinsService from './TransfersStableCoinService.js';
//import { Capability } from 'hedera-stable-coin-sdk';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private stableCoinWithSymbol;
  private stableCoinSymbol;
  private roleStableCoinService = new RoleStableCoinsService();
  private capabilitiesStableCoinService = new CapabilitiesStableCoinService();
  private listStableCoinService = new ListStableCoinsService();
  private stableCoinPaused;
  private stableCoinDeleted;
  private hasKycKey;
  private hasfeeScheduleKey;
  private isFrozen;

  constructor(tokenId?: string, memo?: string, symbol?: string) {
    super('Operation Stable Coin');
    if (tokenId && memo && symbol) {
      this.stableCoinId = tokenId; //TODO Cambiar name por el id que llegue en la creación del token
      this.stableCoinWithSymbol = `${tokenId} - ${symbol}`;
      this.stableCoinSymbol = `${symbol}`;
    }
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    let coins: StableCoinList[];
    try {
      if (this.stableCoinId === undefined) {
        //Get list of stable coins to display
        const resp = await this.listStableCoinService.listStableCoins(false);
        coins = resp.coins;

        this.stableCoinId = await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.askToken'),
          new ManageImportedTokenService().mixImportedTokens(
            coins.map((item) => {
              return `${item.id} - ${item.symbol}`;
            }),
          ),
          true,
          configurationService.getConfiguration()?.defaultNetwork,
          `${configAccount.accountId} - ${configAccount.alias}`,
          this.stableCoinPaused,
          this.stableCoinDeleted,
        );
        this.stableCoinWithSymbol =
          this.stableCoinId.split(' - ').length === 3
            ? `${this.stableCoinId.split(' - ')[0]} - ${
                this.stableCoinId.split(' - ')[1]
              }`
            : this.stableCoinId;
        this.stableCoinId = this.stableCoinId.split(' - ')[0];
        this.stableCoinSymbol = this.stableCoinWithSymbol.split('-')[1];

        if (
          this.stableCoinId === language.getText('wizard.backOption.goBack')
        ) {
          await utilsService.cleanAndShowBanner();
          await wizardService.mainMenu();
        } else {
          // Get details to obtain treasury
          await new DetailsStableCoinsService().getDetailsStableCoins(
            this.stableCoinId,
            false,
          );

          await utilsService.cleanAndShowBanner();
          await this.operationsStableCoin();
        }
      } else {
        await utilsService.cleanAndShowBanner();
        await this.operationsStableCoin();
      }
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async operationsStableCoin(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const wizardOperationsStableCoinOptions = language.getArrayFromObject(
      'wizard.stableCoinOptions',
    );

    const capabilitiesStableCoin: StableCoinCapabilities =
      await this.getCapabilities(currentAccount);

    this.stableCoinDeleted = capabilitiesStableCoin.coin.deleted;
    this.stableCoinPaused = capabilitiesStableCoin.coin.paused;
    this.hasKycKey = capabilitiesStableCoin.coin.kycKey !== undefined;
    this.hasfeeScheduleKey =
      capabilitiesStableCoin.coin.feeScheduleKey !== undefined;

    const freezeAccountRequest = new FreezeAccountRequest({
      tokenId: this.stableCoinId,
      targetId: currentAccount.accountId,
    });

    this.isFrozen = await new FreezeStableCoinService().isAccountFrozen(
      freezeAccountRequest,
    );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething'),
        this.filterMenuOptions(
          wizardOperationsStableCoinOptions,
          capabilitiesStableCoin,
          this.getRolesAccount(),
        ),
        false,
        configAccount.network,
        `${currentAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case language.getText('wizard.stableCoinOptions.Send'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        await this.sendTokens(currentAccount.accountId);

        break;
      case language.getText('wizard.stableCoinOptions.CashIn'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const cashInRequest = new CashInRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          amount: '',
        });

        // Call to mint
        await utilsService.handleValidation(
          () => cashInRequest.validate('targetId'),
          async () => {
            cashInRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId,
            );
          },
        );

        await utilsService.handleValidation(
          () => cashInRequest.validate('amount'),
          async () => {
            cashInRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askCashInAmount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );
        try {
          await new CashInStableCoinsService().cashInStableCoin(cashInRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case language.getText('wizard.stableCoinOptions.Details'):
        await utilsService.cleanAndShowBanner();

        // Call to details
        await new DetailsStableCoinsService().getDetailsStableCoins(
          this.stableCoinId,
        );
        break;
      case language.getText('wizard.stableCoinOptions.Balance'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const getAccountBalanceRequest = new GetAccountBalanceRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        // Call to mint
        await utilsService.handleValidation(
          () => getAccountBalanceRequest.validate('targetId'),
          async () => {
            getAccountBalanceRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.askAccountToBalance'),
                currentAccount.accountId,
              );
          },
        );

        try {
          await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
            getAccountBalanceRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case language.getText('wizard.stableCoinOptions.Burn'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const cashOutRequest = new BurnRequest({
          tokenId: this.stableCoinId,
          amount: '',
        });

        await utilsService.handleValidation(
          () => cashOutRequest.validate('amount'),
          async () => {
            cashOutRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askBurnAmount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );

        try {
          await new BurnStableCoinsService().burnStableCoin(cashOutRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case language.getText('wizard.stableCoinOptions.Wipe'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const wipeRequest = new WipeRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          amount: '',
        });

        // Call to wipe
        await utilsService.handleValidation(
          () => wipeRequest.validate('targetId'),
          async () => {
            wipeRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId,
            );
          },
        );

        await utilsService.handleValidation(
          () => wipeRequest.validate('amount'),
          async () => {
            wipeRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askWipeAmount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );
        try {
          await new WipeStableCoinsService().wipeStableCoin(wipeRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case language.getText('wizard.stableCoinOptions.Rescue'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const rescueRequest = new RescueRequest({
          tokenId: this.stableCoinId,
          amount: '',
        });

        let rescuedAmount = '';
        await utilsService.handleValidation(
          () => rescueRequest.validate('amount'),
          async () => {
            rescuedAmount = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askRescueAmount'),
              '1',
            );
            rescueRequest.amount = rescuedAmount;
          },
        );

        // Call to Rescue
        try {
          await new RescueStableCoinsService().rescueStableCoin(rescueRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case language.getText('wizard.stableCoinOptions.Freeze'):
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const freezeAccountRequest = new FreezeAccountRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        await utilsService.handleValidation(
          () => freezeAccountRequest.validate('targetId'),
          async () => {
            freezeAccountRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('wizard.freezeAccount'),
              '0.0.0',
            );
          },
        );
        try {
          await new FreezeStableCoinService().freezeAccount(
            freezeAccountRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case language.getText('wizard.stableCoinOptions.UnFreeze'):
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const unfreezeAccountRequest = new FreezeAccountRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        await utilsService.handleValidation(
          () => unfreezeAccountRequest.validate('targetId'),
          async () => {
            unfreezeAccountRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('wizard.unfreezeAccount'),
                '0.0.0',
              );
          },
        );
        try {
          await new FreezeStableCoinService().unfreezeAccount(
            unfreezeAccountRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case language.getText('wizard.stableCoinOptions.GrantKYC'):
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const grantKYCRequest = new KYCRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        await utilsService.handleValidation(
          () => grantKYCRequest.validate('targetId'),
          async () => {
            grantKYCRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('wizard.grantKYCToAccount'),
              '0.0.0',
            );
          },
        );
        try {
          await new KYCStableCoinService().grantKYCToAccount(grantKYCRequest);
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }

        break;
      case language.getText('wizard.stableCoinOptions.RevokeKYC'):
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const revokeKYCRequest = new KYCRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        await utilsService.handleValidation(
          () => revokeKYCRequest.validate('targetId'),
          async () => {
            revokeKYCRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('wizard.revokeKYCFromAccount'),
              '0.0.0',
            );
          },
        );
        try {
          await new KYCStableCoinService().revokeKYCFromAccount(
            revokeKYCRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case language.getText('wizard.stableCoinOptions.AccountKYCGranted'):
        await utilsService.cleanAndShowBanner();
        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const checkAccountKYCRequest = new KYCRequest({
          tokenId: this.stableCoinId,
          targetId: '',
        });

        await utilsService.handleValidation(
          () => checkAccountKYCRequest.validate('targetId'),
          async () => {
            checkAccountKYCRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('wizard.checkAccountKYCGranted'),
                '0.0.0',
              );
          },
        );
        try {
          await new KYCStableCoinService().isAccountKYCGranted(
            checkAccountKYCRequest,
          );
        } catch (error) {
          await utilsService.askErrorConfirmation(
            async () => await this.operationsStableCoin(),
            error,
          );
        }
        break;
      case language.getText('wizard.stableCoinOptions.FeesMgmt'):
        await utilsService.cleanAndShowBanner();

        // Call to Supplier Role
        await this.feesManagementFlow();
        break;
      case language.getText('wizard.stableCoinOptions.RoleMgmt'):
        await utilsService.cleanAndShowBanner();

        // Call to Supplier Role
        await this.roleManagementFlow();
        break;
      case language.getText('wizard.stableCoinOptions.RoleRefresh'):
        await utilsService.cleanAndShowBanner();

        const getRolesRequest = new GetRolesRequest({
          targetId: currentAccount.accountId,
          tokenId: this.stableCoinId,
        });

        // Call to Supplier Role
        const rolesToRefresh = await new RoleStableCoinsService().getRoles(
          getRolesRequest,
        );
        const importedTokensRefreshed = configAccount.importedTokens.map(
          (token) => {
            if (token.id === this.stableCoinId) {
              return {
                id: token.id,
                symbol: token.symbol,
                roles: rolesToRefresh,
              };
            }
            return token;
          },
        );
        new ManageImportedTokenService().updateAccount(importedTokensRefreshed);
        configAccount.importedTokens = importedTokensRefreshed;
        break;
      case language.getText('wizard.stableCoinOptions.DangerZone'):
        await utilsService.cleanAndShowBanner();
        await this.dangerZone();
        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
    }
    await this.operationsStableCoin();
  }

  private async getCapabilities(
    currentAccount: RequestAccount,
    tokenIsPaused?: boolean,
    tokenIsDeleted?: boolean,
  ): Promise<StableCoinCapabilities> {
    return await this.capabilitiesStableCoinService.getCapabilitiesStableCoins(
      this.stableCoinId,
      currentAccount,
      tokenIsPaused,
      tokenIsDeleted,
    );
  }

  /**
   * FeeManagement Flow
   */

  private async sendTokens(sender: string): Promise<void> {
    const getAccountBalanceRequest = new GetAccountBalanceRequest({
      tokenId: this.stableCoinId,
      targetId: sender,
    });

    const balance = new Big(
      await new BalanceOfStableCoinsService().getBalanceOfStableCoin_2(
        getAccountBalanceRequest,
      ),
    );

    console.log(this.stableCoinSymbol + ' Balance: ' + balance.toString());

    if (balance.eq(0)) {
      await utilsService.defaultMultipleAsk(
        language.getText('send.noTokens'),
        [],
        true,
      );
      return;
    }

    const transfersRequest = new TransfersRequest({
      tokenId: this.stableCoinId,
      targetId: sender,
      amounts: [],
      targetsId: [],
    });

    let next = true;
    let index = 0;
    let totalSent = new Big(0);

    do {
      transfersRequest.targetsId.push('');
      await utilsService.handleValidation(
        () => transfersRequest.validate('targetsId'),
        async () => {
          transfersRequest.targetsId[index] =
            await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              '0.0.0',
            );
        },
      );

      let totalAmountNOK;

      do {
        totalAmountNOK = false;

        if (transfersRequest.amounts.length <= index)
          transfersRequest.amounts.push('');
        await utilsService.handleValidation(
          () => transfersRequest.validate('amounts'),
          async () => {
            transfersRequest.amounts[index] =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.sendAmount'),
                '1',
              );
          },
        );

        totalSent = totalSent.plus(new Big(transfersRequest.amounts[index]));

        if (totalSent.gt(balance)) {
          totalAmountNOK = true;
          totalSent = totalSent.minus(new Big(transfersRequest.amounts[index]));
          const remainingBalance = balance.minus(totalSent);
          await utilsService.showError(
            'Remaining balance is only : ' + remainingBalance.toString(),
          );
        }
      } while (totalAmountNOK);

      index++;

      if (index >= TRANSFER_LIST_SIZE - 1 || totalSent.eq(balance))
        next = false;

      if (next) {
        next = await utilsService.defaultConfirmAsk(
          language.getText('send.anotherAccount'),
          true,
        );
      }
    } while (next);

    for (let i = 0; i < transfersRequest.targetsId.length; i++) {
      console.log(
        `${transfersRequest.amounts[i]} - ${this.stableCoinSymbol} --> ${transfersRequest.targetsId[i]}`,
      );
    }

    const confirmation = await utilsService.defaultConfirmAsk(
      language.getText('send.confirmation'),
      true,
    );

    if (confirmation) {
      try {
        await new TransfersStableCoinsService().transfersStableCoin(
          transfersRequest,
        );
      } catch (error) {
        await utilsService.askErrorConfirmation(
          async () => await this.operationsStableCoin(),
          error,
        );
      }
    }

    return;
  }

  private async feesManagementFlow(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const stableCoinCapabilities = await this.getCapabilities(
      currentAccount,
      this.stableCoinPaused,
      this.stableCoinDeleted,
    );
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );
    const detailsStableCoin =
      await new DetailsStableCoinsService().getDetailsStableCoins(
        this.stableCoinId,
        false,
      );

    const feeManagementOptionsFiltered = language
      .getArrayFromObject('feeManagement.options')
      .filter((option) => {
        switch (option) {
          case language.getText('feeManagement.options.Create'):
          case language.getText('feeManagement.options.Remove'):
          case language.getText('feeManagement.options.List'):
            const showCustomFee: boolean =
              option == language.getText('feeManagement.options.Create')
                ? capabilities.includes(Operation.CREATE_CUSTOM_FEE)
                : capabilities.includes(Operation.REMOVE_CUSTOM_FEE);
            return showCustomFee;
            break;
        }
        // TODO DELETE STABLE COIN
        return true;
      });

    // const accountTarget = '0.0.0';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditCashInRole'),
        feeManagementOptionsFiltered,
        false,
        configAccount.network,
        `${configAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case language.getText('feeManagement.options.Create'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const feeType = await utilsService.defaultMultipleAsk(
          language.getText('feeManagement.askFeeType'),
          language.getArrayFromObject('feeManagement.chooseFeeType'),
        );

        if (
          feeType == language.getText('feeManagement.chooseFeeType.FixedFee')
        ) {
          await this.createFixedFee(
            detailsStableCoin.decimals ?? 0,
            configAccount.accountId,
          );
        } else {
          await this.createFractionalFee(
            detailsStableCoin.decimals ?? 0,
            configAccount.accountId,
          );
        }

        break;
      case language.getText('feeManagement.options.Remove'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        await this.removeFees(detailsStableCoin.customFees);

        break;
      case language.getText('feeManagement.options.List'):
        console.log(
          new FeeStableCoinService().getSerializedFees(
            detailsStableCoin.customFees,
          ),
        );
        break;
      case feeManagementOptionsFiltered[
        feeManagementOptionsFiltered.length - 1
      ]:
      default:
        await utilsService.cleanAndShowBanner();
        await this.operationsStableCoin();
    }
    await this.feesManagementFlow();
  }

  private async removeFees(customFees: RequestCustomFee[]): Promise<void> {
    let FeesToKeep: RequestCustomFee[] = [];

    const options = new FeeStableCoinService().getSerializedFees(customFees);
    const result = await utilsService.checkBoxMultipleAsk(
      language.getText('feeManagement.askRemoveFee'),
      options,
    );

    console.log(language.getText('feeManagement.listOfFeesToRemove'));
    console.log(result);

    const confirm = await this.askFeeOperationConfirmation(
      language.getText('feeManagement.confirmRemove'),
    );

    if (!confirm) return;

    try {
      FeesToKeep = await new FeeStableCoinService().getRemainingFees(
        customFees,
        options,
        result,
      );
      const updateCustomFeesRequest: UpdateCustomFeesRequest =
        new UpdateCustomFeesRequest({
          tokenId: this.stableCoinId,
          customFees: FeesToKeep,
        });
      await new FeeStableCoinService().updateFees(updateCustomFeesRequest);
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async createFractionalFee(
    decimals: number,
    currentAccount: string,
  ): Promise<void> {
    const addFractionalFeeRequest: AddFractionalFeeRequest =
      new AddFractionalFeeRequest({
        tokenId: this.stableCoinId,
        collectorId: currentAccount,
        collectorsExempt: true,
        min: '0',
        max: '0',
        decimals: decimals,
        net: false,
      });

    const fractionType = await utilsService.defaultMultipleAsk(
      language.getText('feeManagement.askFractionType'),
      language.getArrayFromObject('feeManagement.chooseFractionalType'),
    );

    if (
      fractionType ==
      language.getText('feeManagement.chooseFractionalType.Percentage')
    ) {
      await utilsService.handleValidation(
        () => addFractionalFeeRequest.validate('percentage'),
        async () => {
          addFractionalFeeRequest.percentage =
            await utilsService.defaultSingleAsk(
              language.getText('feeManagement.askPercentageFee'),
              '1',
            );
        },
      );
    } else {
      await utilsService.handleValidation(
        () => addFractionalFeeRequest.validate('amountNumerator'),
        async () => {
          addFractionalFeeRequest.amountNumerator =
            await utilsService.defaultSingleAsk(
              language.getText('feeManagement.askNumerator'),
              '1',
            );
        },
      );

      await utilsService.handleValidation(
        () => addFractionalFeeRequest.validate('amountDenominator'),
        async () => {
          addFractionalFeeRequest.amountDenominator =
            await utilsService.defaultSingleAsk(
              language.getText('feeManagement.askDenominator'),
              '2',
            );
        },
      );
    }

    await utilsService.handleValidation(
      () => addFractionalFeeRequest.validate('min'),
      async () => {
        addFractionalFeeRequest.min = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askMin'),
          '0',
        );
      },
    );

    await utilsService.handleValidation(
      () => addFractionalFeeRequest.validate('max'),
      async () => {
        addFractionalFeeRequest.max = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askMax'),
          '0',
        );
      },
    );

    addFractionalFeeRequest.net = await utilsService.defaultConfirmAsk(
      language.getText('feeManagement.askAssesmentMethod'),
      true,
    );

    addFractionalFeeRequest.collectorsExempt =
      await utilsService.defaultConfirmAsk(
        language.getText('feeManagement.askCollectorsExempt'),
        true,
      );

    await utilsService.handleValidation(
      () => addFractionalFeeRequest.validate('collectorId'),
      async () => {
        addFractionalFeeRequest.collectorId =
          await utilsService.defaultSingleAsk(
            language.getText('feeManagement.askCollectorId'),
            currentAccount,
          );
      },
    );

    console.log({
      percentage: addFractionalFeeRequest.percentage ?? '-',
      numerator: addFractionalFeeRequest.amountNumerator ?? '-',
      denominator: addFractionalFeeRequest.amountDenominator ?? '-',
      min: addFractionalFeeRequest.min,
      max: addFractionalFeeRequest.max,
      feesPaidBy: addFractionalFeeRequest.net ? 'Sender' : 'Receiver',
      collector: addFractionalFeeRequest.collectorId,
      collectorsExempt: addFractionalFeeRequest.collectorsExempt,
    });

    const confirm = await this.askFeeOperationConfirmation(
      language.getText('feeManagement.confirmCreate'),
    );

    if (!confirm) return;

    try {
      await new FeeStableCoinService().addFractionalFee(
        addFractionalFeeRequest,
      );
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async createFixedFee(
    decimals: number,
    currentAccount: string,
  ): Promise<void> {
    const addFixedFeeRequest: AddFixedFeeRequest = new AddFixedFeeRequest({
      tokenId: this.stableCoinId,
      collectorId: currentAccount,
      collectorsExempt: true,
      tokenIdCollected: '0.0.0',
      amount: '1',
      decimals: HBAR_DECIMALS,
    });

    const feesInHBAR = await utilsService.defaultConfirmAsk(
      language.getText('feeManagement.askHBAR'),
      true,
    );

    addFixedFeeRequest.tokenIdCollected = '0.0.0';

    if (!feesInHBAR) {
      let tryAgain: boolean;

      do {
        tryAgain = false;

        await utilsService.handleValidation(
          () => addFixedFeeRequest.validate('tokenIdCollected'),
          async () => {
            addFixedFeeRequest.tokenIdCollected =
              await utilsService.defaultSingleAsk(
                language.getText('feeManagement.askTokenId'),
                this.stableCoinId,
              );
          },
        );

        if (addFixedFeeRequest.tokenIdCollected == '0.0.0') {
          console.log('HBAR selected');
        } else if (addFixedFeeRequest.tokenIdCollected !== this.stableCoinId) {
          try {
            const detailsExternalStableCoin =
              await new DetailsStableCoinsService().getDetailsStableCoins(
                addFixedFeeRequest.tokenIdCollected,
                false,
              );
            addFixedFeeRequest.decimals =
              detailsExternalStableCoin.decimals ?? 0;
          } catch (error) {
            utilsService.showError(
              'Error getting the token details : ' + error.message,
            );
            tryAgain = true;
          }
        } else addFixedFeeRequest.decimals = decimals;
      } while (tryAgain);
    }

    await utilsService.handleValidation(
      () => addFixedFeeRequest.validate('amount'),
      async () => {
        addFixedFeeRequest.amount = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askAmount'),
          '1',
        );
      },
    );

    addFixedFeeRequest.collectorsExempt = await utilsService.defaultConfirmAsk(
      language.getText('feeManagement.askCollectorsExempt'),
      true,
    );

    await utilsService.handleValidation(
      () => addFixedFeeRequest.validate('collectorId'),
      async () => {
        addFixedFeeRequest.collectorId = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askCollectorId'),
          currentAccount,
        );
      },
    );

    console.log({
      amount: addFixedFeeRequest.amount,
      token:
        addFixedFeeRequest.tokenIdCollected !== '0.0.0'
          ? addFixedFeeRequest.tokenIdCollected
          : 'HBAR',
      collector: addFixedFeeRequest.collectorId,
      collectorsExempt: addFixedFeeRequest.collectorsExempt,
    });

    const confirm = await this.askFeeOperationConfirmation(
      language.getText('feeManagement.confirmCreate'),
    );

    if (!confirm) return;

    try {
      await new FeeStableCoinService().addFixedFee(addFixedFeeRequest);
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async askFeeOperationConfirmation(Text: string): Promise<boolean> {
    return await utilsService.defaultConfirmAsk(Text, true);
  }

  /**
   * RoleManagement Flow
   */

  private async roleManagementFlow(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const stableCoinCapabilities = await this.getCapabilities(currentAccount);
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );

    const roleManagementOptionsFiltered = language
      .getArrayFromObject('wizard.roleManagementOptions')
      .filter((option) => {
        if (option == language.getText('wizard.roleManagementOptions.Edit')) {
          return capabilities.includes(Operation.CASH_IN);
        }

        return true;
      });

    const accountTarget = '0.0.0';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditCashInRole'),
        roleManagementOptionsFiltered,
        false,
        configAccount.network,
        `${configAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case language.getText('wizard.roleManagementOptions.Grant'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        await this.grantRoles(stableCoinCapabilities);

        break;
      case language.getText('wizard.roleManagementOptions.Revoke'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        await this.revokeRoles(stableCoinCapabilities);

        break;
      case language.getText('wizard.roleManagementOptions.Edit'):
        await utilsService.cleanAndShowBanner();

        //Call to edit role
        const editOptions = language.getArrayFromObject(
          'roleManagement.editAction',
        );
        switch (
          await utilsService.defaultMultipleAsk(
            language.getText('roleManagement.askRole'),
            editOptions,
            false,
            configAccount.network,
            `${currentAccount.accountId} - ${configAccount.alias}`,
            this.stableCoinWithSymbol,
            this.stableCoinPaused,
            this.stableCoinDeleted,
          )
        ) {
          case editOptions[0]:
            await utilsService.cleanAndShowBanner();

            try {
              utilsService.displayCurrentUserInfo(
                configAccount,
                this.stableCoinWithSymbol,
              );

              //Increase limit
              const increaseCashInLimitRequest =
                new IncreaseSupplierAllowanceRequest({
                  tokenId: this.stableCoinId,
                  targetId: '',
                  amount: '',
                });

              await this.validateNotRequestedData(increaseCashInLimitRequest, [
                'tokenId',
              ]);

              let increaseCashInLimitTargetId = accountTarget;

              await utilsService.handleValidation(
                () => increaseCashInLimitRequest.validate('targetId'),
                async () => {
                  increaseCashInLimitTargetId =
                    await utilsService.defaultSingleAsk(
                      language.getText('stablecoin.accountTarget'),
                      accountTarget,
                    );
                  increaseCashInLimitRequest.targetId =
                    increaseCashInLimitTargetId;
                },
              );

              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: increaseCashInLimitRequest.targetId,
                    tokenId: increaseCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Unlimited',
                    ),
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              if (
                !(await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: increaseCashInLimitRequest.targetId,
                    tokenId: increaseCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Limited',
                    ),
                  }),
                ))
              ) {
                console.log(language.getText('cashin.notRole'));
                break;
              }

              let increaseAmount = '';

              await utilsService.handleValidation(
                () => increaseCashInLimitRequest.validate('amount'),
                async () => {
                  increaseAmount = await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.amountIncrease'),
                    '1',
                  );
                  increaseCashInLimitRequest.amount = increaseAmount;
                },
              );
              //Call to SDK
              await this.roleStableCoinService.increaseLimitSupplierRoleStableCoin(
                increaseCashInLimitRequest,
              );

              await this.roleStableCoinService.getSupplierAllowance(
                new GetSupplierAllowanceRequest({
                  targetId: increaseCashInLimitRequest.targetId,
                  tokenId: increaseCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[1]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            //Decrease limit
            const decreaseCashInLimitRequest =
              new DecreaseSupplierAllowanceRequest({
                tokenId: this.stableCoinId,
                targetId: '',
                amount: '',
              });

            await this.validateNotRequestedData(decreaseCashInLimitRequest, [
              'tokenId',
            ]);

            let decreaseCashInLimitTargetId = accountTarget;

            await utilsService.handleValidation(
              () => decreaseCashInLimitRequest.validate('targetId'),
              async () => {
                decreaseCashInLimitTargetId =
                  await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.accountTarget'),
                    accountTarget,
                  );
                decreaseCashInLimitRequest.targetId =
                  decreaseCashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: decreaseCashInLimitRequest.targetId,
                    tokenId: decreaseCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Unlimited',
                    ),
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              if (
                !(await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: decreaseCashInLimitRequest.targetId,
                    tokenId: decreaseCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Limited',
                    ),
                  }),
                ))
              ) {
                console.log(language.getText('cashin.notRole'));
                break;
              }

              let decreaseAmount = '';

              await utilsService.handleValidation(
                () => decreaseCashInLimitRequest.validate('amount'),
                async () => {
                  decreaseAmount = await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.amountDecrease'),
                    '1',
                  );
                  decreaseCashInLimitRequest.amount = decreaseAmount;
                },
              );

              await this.roleStableCoinService.decreaseLimitSupplierRoleStableCoin(
                decreaseCashInLimitRequest,
              );
              await this.roleStableCoinService.getSupplierAllowance(
                new GetSupplierAllowanceRequest({
                  targetId: decreaseCashInLimitRequest.targetId,
                  tokenId: decreaseCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[2]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            const resetCashInLimitRequest = new ResetSupplierAllowanceRequest({
              targetId: '',
              tokenId: this.stableCoinId,
            });

            //Reset
            let resetCashInLimitTargetId = accountTarget;

            await utilsService.handleValidation(
              () => resetCashInLimitRequest.validate('targetId'),
              async () => {
                resetCashInLimitTargetId = await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
                resetCashInLimitRequest.targetId = resetCashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: resetCashInLimitRequest.targetId,
                    tokenId: resetCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Unlimited',
                    ),
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              //Call to SDK
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: resetCashInLimitRequest.targetId,
                    tokenId: resetCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Limited',
                    ),
                  }),
                )
              ) {
                await this.roleStableCoinService.resetLimitSupplierRoleStableCoin(
                  resetCashInLimitRequest,
                );
              } else {
                console.log(language.getText('cashin.notRole'));
              }
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[3]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            const checkCashInLimitRequest = new CheckSupplierLimitRequest({
              tokenId: this.stableCoinId,
              targetId: '',
            });

            await this.validateNotRequestedData(checkCashInLimitRequest, [
              'tokenId',
            ]);

            let cashInLimitTargetId = accountTarget;

            await utilsService.handleValidation(
              () => checkCashInLimitRequest.validate('targetId'),
              async () => {
                cashInLimitTargetId = await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
                checkCashInLimitRequest.targetId = cashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckSupplierLimitRequest({
                    targetId: checkCashInLimitRequest.targetId,
                    tokenId: checkCashInLimitRequest.tokenId,
                    supplierType: language.getText(
                      'wizard.supplierRoleType.Unlimited',
                    ),
                  }),
                )
              ) {
                const response = language.getText(
                  'roleManagement.accountHasRoleCashInUnlimited',
                );

                console.log(
                  response.replace(
                    '${address}',
                    checkCashInLimitRequest.targetId,
                  ) + '\n',
                );
                break;
              }
              await this.roleStableCoinService.getSupplierAllowance(
                new GetSupplierAllowanceRequest({
                  targetId: checkCashInLimitRequest.targetId,
                  tokenId: checkCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[editOptions.length - 1]:
          default:
            await utilsService.cleanAndShowBanner();

            await this.roleManagementFlow();
        }
        break;
      case language.getText('wizard.roleManagementOptions.GetRole'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const getRolesRequest = new GetRolesRequest({
          targetId: '',
          tokenId: this.stableCoinId,
        });

        await utilsService.handleValidation(
          () => getRolesRequest.validate('targetId'),
          async () => {
            getRolesRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('roleManagement.askAccount'),
              currentAccount.accountId,
            );
          },
        );

        await new RoleStableCoinsService().getRoles(getRolesRequest);

        break;
      case roleManagementOptionsFiltered[
        roleManagementOptionsFiltered.length - 1
      ]:
      default:
        await utilsService.cleanAndShowBanner();

        await this.operationsStableCoin();
    }
    await this.roleManagementFlow();
  }

  private async grantRoles(stableCoinCapabilities): Promise<void> {
    const grantMultiRolesRequest = new GrantMultiRolesRequest({
      tokenId: this.stableCoinId,
      roles: [],
      targetsId: [],
      amounts: [],
    });

    await this.validateNotRequestedData(grantMultiRolesRequest, ['tokenId']);

    // choosing the roles to grant
    const listOfRoles = await this.getRoles(
      stableCoinCapabilities,
      grantMultiRolesRequest,
    );

    // choosing the accounts to grant the roles to
    await this.getAccounts(grantMultiRolesRequest, true);

    const allowances: string[] = [];
    grantMultiRolesRequest.amounts.forEach((amount) => {
      if (amount == '0') allowances.push('Unlimited');
      else allowances.push(amount);
    });

    console.log({
      roles: listOfRoles,
      accounts: grantMultiRolesRequest.targetsId,
      allowances: allowances,
    });

    const confirm = await utilsService.defaultConfirmAsk(
      language.getText('roleManagement.askConfirmation'),
      true,
    );

    if (!confirm) return;

    try {
      await new RoleStableCoinsService().grantMultiRolesStableCoin(
        grantMultiRolesRequest,
      );
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async revokeRoles(stableCoinCapabilities): Promise<void> {
    const revokeMultiRolesRequest = new RevokeMultiRolesRequest({
      tokenId: this.stableCoinId,
      roles: [],
      targetsId: [],
    });

    await this.validateNotRequestedData(revokeMultiRolesRequest, ['tokenId']);

    // choosing the roles to grant
    const listOfRoles = await this.getRoles(
      stableCoinCapabilities,
      revokeMultiRolesRequest,
    );

    // choosing the accounts to grant the roles to
    await this.getAccounts(revokeMultiRolesRequest, false);

    console.log({
      roles: listOfRoles,
      accounts: revokeMultiRolesRequest.targetsId,
    });

    const confirm = await utilsService.defaultConfirmAsk(
      language.getText('roleManagement.askConfirmation'),
      true,
    );

    if (!confirm) return;

    try {
      await new RoleStableCoinsService().revokeMultiRolesStableCoin(
        revokeMultiRolesRequest,
      );
    } catch (error) {
      await utilsService.askErrorConfirmation(
        async () => await this.operationsStableCoin(),
        error,
      );
    }
  }

  private async validateNotRequestedData(
    request: any,
    params: string[],
  ): Promise<void> {
    for (let i = 0; i < params.length; i++) {
      await utilsService.handleValidation(
        () => request.validate(params[i]),
        async () => {
          await this.operationsStableCoin();
        },
        true,
        true,
      );
    }
  }

  private filterMenuOptions(
    options: string[],
    stableCoinCapabilities: StableCoinCapabilities,
    roles?: string[],
  ): string[] {
    let result = [];
    let capabilitiesFilter = [];
    // if (stableCoinCapabilities.capabilities.length === 0) return options;
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );

    capabilitiesFilter = options.filter((option) => {
      if (
        (option === language.getText('wizard.stableCoinOptions.Send') &&
          !this.stableCoinDeleted &&
          !this.stableCoinPaused &&
          !this.isFrozen) ||
        (option === language.getText('wizard.stableCoinOptions.CashIn') &&
          capabilities.includes(Operation.CASH_IN)) ||
        (option === language.getText('wizard.stableCoinOptions.Burn') &&
          capabilities.includes(Operation.BURN)) ||
        (option === language.getText('wizard.stableCoinOptions.Wipe') &&
          capabilities.includes(Operation.WIPE)) ||
        (option === language.getText('wizard.stableCoinOptions.Rescue') &&
          capabilities.includes(Operation.RESCUE)) ||
        (option === language.getText('wizard.stableCoinOptions.Freeze') &&
          capabilities.includes(Operation.FREEZE)) ||
        (option === language.getText('wizard.stableCoinOptions.UnFreeze') &&
          capabilities.includes(Operation.UNFREEZE)) ||
        (option === language.getText('wizard.stableCoinOptions.GrantKYC') &&
          capabilities.includes(Operation.GRANT_KYC)) ||
        (option === language.getText('wizard.stableCoinOptions.RevokeKYC') &&
          capabilities.includes(Operation.REVOKE_KYC)) ||
        (option ===
          language.getText('wizard.stableCoinOptions.AccountKYCGranted') &&
          capabilities.includes(Operation.GRANT_KYC) &&
          capabilities.includes(Operation.REVOKE_KYC)) ||
        (option === language.getText('wizard.stableCoinOptions.DangerZone') &&
          (capabilities.includes(Operation.PAUSE) ||
            capabilities.includes(Operation.DELETE))) ||
        (option === language.getText('wizard.stableCoinOptions.RoleMgmt') &&
          capabilities.includes(Operation.ROLE_MANAGEMENT)) ||
        (option === language.getText('wizard.stableCoinOptions.FeesMgmt') &&
          this.hasfeeScheduleKey) ||
        (option === language.getText('wizard.stableCoinOptions.RoleRefresh') &&
          !this.stableCoinDeleted) ||
        (option === language.getText('wizard.stableCoinOptions.Details') &&
          !this.stableCoinDeleted) ||
        (option === language.getText('wizard.stableCoinOptions.Balance') &&
          !this.stableCoinDeleted) ||
        (option ===
          language.getText('wizard.stableCoinOptions.AccountKYCGranted') &&
          this.hasKycKey)
      ) {
        return true;
      }
      return false;
    });

    result = roles
      ? capabilitiesFilter.filter((option) => {
          if (
            (option === language.getText('wizard.stableCoinOptions.CashIn') &&
              roles.includes(StableCoinRole.CASHIN_ROLE)) ||
            (option === language.getText('wizard.stableCoinOptions.CashIn') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.CASH_IN,
                Access.HTS,
              )) ||
            (option === language.getText('wizard.stableCoinOptions.Burn') &&
              roles.includes(StableCoinRole.BURN_ROLE)) ||
            (option === language.getText('wizard.stableCoinOptions.Burn') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.BURN,
                Access.HTS,
              )) ||
            (option === language.getText('wizard.stableCoinOptions.Wipe') &&
              roles.includes(StableCoinRole.WIPE_ROLE)) ||
            (option === language.getText('wizard.stableCoinOptions.Wipe') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.WIPE,
                Access.HTS,
              )) ||
            (option === language.getText('wizard.stableCoinOptions.Freeze') &&
              roles.includes(StableCoinRole.FREEZE_ROLE)) ||
            (option === language.getText('wizard.stableCoinOptions.Freeze') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.FREEZE,
                Access.HTS,
              )) ||
            (option === language.getText('wizard.stableCoinOptions.UnFreeze') &&
              roles.includes(StableCoinRole.FREEZE_ROLE)) ||
            (option === language.getText('wizard.stableCoinOptions.UnFreeze') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.UNFREEZE,
                Access.HTS,
              )) ||
            (option === language.getText('wizard.stableCoinOptions.GrantKYC') &&
              roles.includes(StableCoinRole.KYC_ROLE)) ||
            (option === language.getText('wizard.stableCoinOptions.GrantKYC') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.GRANT_KYC,
                Access.HTS,
              )) ||
            (option ===
              language.getText('wizard.stableCoinOptions.RevokeKYC') &&
              roles.includes(StableCoinRole.KYC_ROLE)) ||
            (option ===
              language.getText('wizard.stableCoinOptions.RevokeKYC') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.REVOKE_KYC,
                Access.HTS,
              )) ||
            (option ===
              language.getText('wizard.stableCoinOptions.DangerZone') &&
              roles.includes(StableCoinRole.PAUSE_ROLE)) ||
            (option ===
              language.getText('wizard.stableCoinOptions.DangerZone') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.PAUSE,
                Access.HTS,
              )) ||
            (option ===
              language.getText('wizard.stableCoinOptions.DangerZone') &&
              roles.includes(StableCoinRole.DELETE_ROLE)) ||
            (option ===
              language.getText('wizard.stableCoinOptions.DangerZone') &&
              this.isOperationAccess(
                stableCoinCapabilities,
                Operation.DELETE,
                Access.HTS,
              )) ||
            (option === language.getText('wizard.stableCoinOptions.Rescue') &&
              roles.includes(StableCoinRole.RESCUE_ROLE)) ||
            option ===
              language.getText('wizard.stableCoinOptions.RoleRefresh') ||
            option === language.getText('wizard.stableCoinOptions.Details') ||
            option === language.getText('wizard.stableCoinOptions.Balance') ||
            option ===
              language.getText('wizard.stableCoinOptions.AccountKYCGranted') ||
            (option === language.getText('wizard.stableCoinOptions.RoleMgmt') &&
              roles.includes(StableCoinRole.DEFAULT_ADMIN_ROLE))
          ) {
            return true;
          }
          return false;
        })
      : capabilitiesFilter;

    return result.concat(language.getArrayFromObject('wizard.returnOption'));
  }

  private isOperationAccess(
    stableCoinCapabilities: StableCoinCapabilities,
    operation: Operation,
    access: Access,
  ): boolean {
    return stableCoinCapabilities.capabilities.some(
      (e) => e.operation === operation && e.access === access,
    );
  }

  /*private async getRole(
    stableCoinCapabilities: StableCoinCapabilities,
  ): Promise<any> {
    const capabilities: Capability[] = stableCoinCapabilities.capabilities;
    const rolesAvailability = [
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.CASH_IN &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Cash in Role',
          value: StableCoinRole.CASHIN_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.BURN &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Burn Role',
          value: StableCoinRole.BURN_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.WIPE &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Wipe Role',
          value: StableCoinRole.WIPE_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.RESCUE &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Rescue Role',
          value: StableCoinRole.RESCUE_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.PAUSE &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Pause Role',
          value: StableCoinRole.PAUSE_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.FREEZE &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Freeze Role',
          value: StableCoinRole.FREEZE_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.GRANT_KYC &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'KYC Role',
          value: StableCoinRole.KYC_ROLE,
        },
      },
      {
        role: {
          // TODO Eliminar el DELETE HTS cuando se pueda eliminar desde contrato (SOLO para ver la opción)
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.DELETE &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Delete Role',
          value: StableCoinRole.DELETE_ROLE,
        },
      },
      {
        role: {
          availability:
            capabilities.filter(
              (capability) =>
                capability.operation === Operation.ROLE_ADMIN_MANAGEMENT &&
                capability.access === Access.CONTRACT,
            ).length > 0,
          name: 'Admin Role',
          value: StableCoinRole.DEFAULT_ADMIN_ROLE,
        },
      },
    ];

    const rolesAvailable = rolesAvailability.filter(
      ({ role }) => role.availability,
    );
    const rolesNames = rolesAvailable.map(({ role }) => role.name);

    const roleSelected = await utilsService.defaultMultipleAsk(
      language.getText('roleManagement.askRole'),
      rolesNames,
      true,
    );
    if (roleSelected !== language.getText('wizard.backOption.goBack')) {
      const roleValue = rolesAvailable.filter(
        ({ role }) => role.name == roleSelected,
      )[0].role.value;
      return roleValue;
    }
    return roleSelected;
  }*/

  private async getRoles(
    stableCoinCapabilities: StableCoinCapabilities,
    request: any,
  ): Promise<any> {
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );
    const rolesAvailability = [
      {
        role: {
          availability: capabilities.includes(Operation.CASH_IN),
          name: 'Cash in Role',
          value: StableCoinRole.CASHIN_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.BURN),
          name: 'Burn Role',
          value: StableCoinRole.BURN_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.WIPE),
          name: 'Wipe Role',
          value: StableCoinRole.WIPE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.RESCUE),
          name: 'Rescue Role',
          value: StableCoinRole.RESCUE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.PAUSE),
          name: 'Pause Role',
          value: StableCoinRole.PAUSE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.FREEZE),
          name: 'Freeze Role',
          value: StableCoinRole.FREEZE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.GRANT_KYC),
          name: 'KYC Role',
          value: StableCoinRole.KYC_ROLE,
        },
      },
      {
        role: {
          // TODO Eliminar el DELETE HTS cuando se pueda eliminar desde contrato (SOLO para ver la opción)
          availability: capabilities.includes(Operation.DELETE),
          name: 'Delete Role',
          value: StableCoinRole.DELETE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Operation.ROLE_ADMIN_MANAGEMENT),
          name: 'Admin Role',
          value: StableCoinRole.DEFAULT_ADMIN_ROLE,
        },
      },
    ];

    const rolesAvailable = rolesAvailability.filter(
      ({ role }) => role.availability,
    );
    const rolesNames = rolesAvailable.map(({ role }) => role.name);

    const rolesSelected = await utilsService.checkBoxMultipleAsk(
      language.getText('roleManagement.askRoles'),
      rolesNames,
      false,
      true,
    );

    const rolesToReturn: StableCoinRole[] = [];

    rolesSelected.forEach((roleSelected) => {
      rolesToReturn.push(
        rolesAvailable.filter(({ role }) => role.name == roleSelected)[0].role
          .value,
      );
    });

    request.roles = rolesToReturn;

    return rolesSelected;
  }

  private async getAccounts(request: any, grant: boolean): Promise<any> {
    let moreAccounts = true;
    let index = 0;

    const cashIn = request.roles.indexOf(StableCoinRole.CASHIN_ROLE) != -1;

    do {
      request.targetsId.push('');

      await utilsService.handleValidation(
        () => request.validate('targetsId'),
        async () => {
          request.targetsId[index] = await utilsService.defaultSingleAsk(
            language.getText('roleManagement.askAccount'),
            '0.0.0',
          );
        },
      );

      if (grant && cashIn) {
        request.amounts.push('0');

        const unlimited = await utilsService.defaultConfirmAsk(
          language.getText('roleManagement.askUnlimited'),
          true,
        );

        if (!unlimited) {
          await utilsService.handleValidation(
            () => request.validate('amounts'),
            async () => {
              request.amounts[index] = await utilsService.defaultSingleAsk(
                language.getText('roleManagement.askAllowance'),
                '0',
              );
            },
          );
        }
      }

      index++;
      if (index < MAX_ACCOUNTS_ROLES)
        moreAccounts = await utilsService.defaultConfirmAsk(
          language.getText('roleManagement.askMoreAccounts'),
          true,
        );
      else moreAccounts = false;
    } while (moreAccounts);
  }

  private getRolesAccount(): string[] {
    const configAccount = utilsService.getCurrentAccount();
    const importedToken = configAccount.importedTokens.find(
      (token) => token.id === this.stableCoinId,
    );
    return importedToken?.roles;
  }

  private async checkSupplierType(
    req: CheckSupplierLimitRequest,
  ): Promise<boolean> {
    return await this.roleStableCoinService.checkCashInRoleStableCoin(req);
  }

  private async dangerZone(): Promise<void> {
    const configAccount = utilsService.getCurrentAccount();
    const privateKey: RequestPrivateKey = {
      key: configAccount.privateKey.key,
      type: configAccount.privateKey.type,
    };
    const currentAccount: RequestAccount = {
      accountId: configAccount.accountId,
      privateKey: privateKey,
    };

    const stableCoinCapabilities = await this.getCapabilities(
      currentAccount,
      this.stableCoinPaused,
      this.stableCoinDeleted,
    );
    const capabilities: Operation[] = stableCoinCapabilities.capabilities.map(
      (a) => a.operation,
    );

    const rolesAccount = this.getRolesAccount();

    const dangerZoneOptionsFiltered = language
      .getArrayFromObject('dangerZone.options')
      .filter((option) => {
        switch (option) {
          case language.getText('dangerZone.options.Pause'):
          case language.getText('dangerZone.options.UnPause'):
            let showPauser: boolean =
              option == language.getText('dangerZone.options.Pause')
                ? !this.stableCoinPaused
                : this.stableCoinPaused;
            if (showPauser && rolesAccount) {
              showPauser =
                rolesAccount.includes(StableCoinRole.PAUSE_ROLE) ||
                this.isOperationAccess(
                  stableCoinCapabilities,
                  Operation.PAUSE,
                  Access.HTS,
                );
            }
            return showPauser;
            break;
          case language.getText('dangerZone.options.Delete'):
            let showDelete: boolean = capabilities.includes(Operation.DELETE);
            if (showDelete && rolesAccount) {
              showDelete = rolesAccount.includes(StableCoinRole.DELETE_ROLE);
            }
            return showDelete;
            break;
        }
        // TODO DELETE STABLE COIN
        return true;
      });

    // const accountTarget = '0.0.0';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditCashInRole'),
        dangerZoneOptionsFiltered,
        false,
        configAccount.network,
        `${configAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
        this.stableCoinPaused,
        this.stableCoinDeleted,
      )
    ) {
      case language.getText('dangerZone.options.Pause'):
        const confirmPause = await utilsService.defaultConfirmAsk(
          language.getText('dangerZone.confirmPause'),
          true,
        );
        if (confirmPause) {
          try {
            const req = new PauseRequest({
              tokenId: this.stableCoinId,
            });
            await new PauseStableCoinService().pauseStableCoin(req);
            this.stableCoinPaused = true;
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }

        break;
      case language.getText('dangerZone.options.UnPause'):
        const confirmUnpause = await utilsService.defaultConfirmAsk(
          language.getText('dangerZone.confirmUnpause'),
          true,
        );
        if (confirmUnpause) {
          try {
            const req = new PauseRequest({
              tokenId: this.stableCoinId,
            });
            await new PauseStableCoinService().unpauseStableCoin(req);
            this.stableCoinPaused = false;
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }

        break;
      case language.getText('dangerZone.options.Delete'):
        const confirmDelete = await utilsService.defaultConfirmAsk(
          language.getText('dangerZone.confirmDelete'),
          true,
        );
        if (confirmDelete) {
          try {
            const req = new DeleteRequest({
              tokenId: this.stableCoinId,
            });

            await new DeleteStableCoinService().deleteStableCoin(req);
            this.stableCoinDeleted = true;
            await wizardService.mainMenu();
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
        break;
      case dangerZoneOptionsFiltered[dangerZoneOptionsFiltered.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();
        await this.operationsStableCoin();
    }
    await this.dangerZone();
  }
}
