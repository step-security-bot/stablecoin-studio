import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
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
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
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
  CustomFee,
  UpdateCustomFeesRequest,
  HBAR_DECIMALS,
  MAX_PERCENTAGE_DECIMALS,
  BigDecimal,
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
import UtilitiesService from '../utilities/UtilitiesService.js';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private stableCoinWithSymbol;
  private roleStableCoinService = new RoleStableCoinsService();
  private capabilitiesStableCoinService = new CapabilitiesStableCoinService();
  private listStableCoinService = new ListStableCoinsService();
  private stableCoinPaused;
  private stableCoinDeleted;
  private hasKycKey;
  private hasfeeScheduleKey;

  constructor(tokenId?: string, memo?: string, symbol?: string) {
    super('Operation Stable Coin');
    if (tokenId && memo && symbol) {
      this.stableCoinId = tokenId; //TODO Cambiar name por el id que llegue en la creación del token
      this.stableCoinWithSymbol = `${tokenId} - ${symbol}`;
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
        cashInRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        await utilsService.handleValidation(
          () => cashInRequest.validate('targetId'),
          async () => {
            cashInRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId,
            );
          },
        );

        cashInRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askCashInAmount'), '1')
          .then((val) => val.replace(',', '.'));

        await utilsService.handleValidation(
          () => cashInRequest.validate('amount'),
          async () => {
            cashInRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askTargetAccount'),
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
        getAccountBalanceRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAccountToBalance'),
          currentAccount.accountId,
        );
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

        cashOutRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askBurnAmount'), '1')
          .then((val) => val.replace(',', '.'));

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
        wipeRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        await utilsService.handleValidation(
          () => wipeRequest.validate('targetId'),
          async () => {
            wipeRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId,
            );
          },
        );

        wipeRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askWipeAmount'), '1')
          .then((val) => val.replace(',', '.'));

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
        rescueRequest.amount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askRescueAmount'),
          '1',
        );
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
        freezeAccountRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.freezeAccount'),
          '0.0.0',
        );

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
        unfreezeAccountRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.unfreezeAccount'),
          '0.0.0',
        );

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
        grantKYCRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.grantKYCToAccount'),
          '0.0.0',
        );

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
        revokeKYCRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.revokeKYCFromAccount'),
          '0.0.0',
        );

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
        checkAccountKYCRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('wizard.checkAccountKYCGranted'),
          '0.0.0',
        );

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

    //const rolesAccount = this.getRolesAccount();

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
            /*if (showCustomFee && rolesAccount) {
              showCustomFee =
                rolesAccount.includes(StableCoinRole.CREATE_CUSTOM_FEE) ||
                this.isOperationAccess(
                  stableCoinCapabilities,
                  Operation.CREATE_CUSTOM_FEE,
                  Access.HTS,
                );
            }*/
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
          await this.createFixedFee(detailsStableCoin.decimals ?? 0);
        } else {
          await this.createFractionalFee(detailsStableCoin.decimals ?? 0);
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
          new FeeStableCoinService().getFormatedFees(
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

  private async removeFees(customFees): Promise<void> {
    const FeesToKeep: CustomFee[] = [];
    const FeesToRemove: CustomFee[] = [];

    for (let i = 0; i < customFees.length; i++) {
      const fee = customFees[i];
      console.log(new FeeStableCoinService().getFormatedFees([fee]));
      const remove = await utilsService.defaultConfirmAsk(
        language.getText('feeManagement.askRemoveFee'),
        false,
      );
      if (remove) FeesToRemove.push(fee);
      else FeesToKeep.push(fee);
    }

    console.log(language.getText('feeManagement.listOfFeesToRemove'));
    console.log(new FeeStableCoinService().getFormatedFees(FeesToRemove));

    const confirm = await this.askFeeOperationConfirmation(
      language.getText('feeManagement.confirmRemove'),
    );

    if (!confirm) return;

    try {
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

  private async createFractionalFee(decimals: number): Promise<void> {
    const addFractionalFeeRequest: AddFractionalFeeRequest =
      new AddFractionalFeeRequest({
        tokenId: this.stableCoinId,
        collectorId: '',
        amountNumerator: '',
        amountDenominator: '',
        min: '',
        max: '',
        decimals: decimals,
        net: false,
        collectorsExempt: true,
      });

    const fractionType = await utilsService.defaultMultipleAsk(
      language.getText('feeManagement.askFractionType'),
      language.getArrayFromObject('feeManagement.chooseFractionalType'),
    );

    if (
      fractionType ==
      language.getText('feeManagement.chooseFractionalType.Percentage')
    ) {
      let check_Ok = true;
      let numerator = BigDecimal.fromString('0');
      const exponential = 10 ** MAX_PERCENTAGE_DECIMALS;
      const denominator = 100 * exponential;

      do {
        check_Ok = true;

        const percentage = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askPercentageFee'),
          '1',
        );

        try {
          const valueDecimals = BigDecimal.getDecimalsFromString(percentage);
          if (valueDecimals > MAX_PERCENTAGE_DECIMALS) throw new Error();

          numerator = BigDecimal.fromString(
            percentage,
            MAX_PERCENTAGE_DECIMALS,
          );

          const zero = BigDecimal.fromString('0', MAX_PERCENTAGE_DECIMALS);

          if (
            !numerator.isGreaterThan(zero) ||
            numerator.isGreaterOrEqualThan(
              BigDecimal.fromString(denominator.toString()),
            )
          )
            throw new Error();
        } catch (e) {
          new UtilitiesService().showError(
            `Invalid Percentage. Please check that the entered value is a positive number with no more than ${MAX_PERCENTAGE_DECIMALS} decimals`,
          );
          check_Ok = false;
        }
      } while (!check_Ok);

      addFractionalFeeRequest.amountNumerator = Math.floor(
        numerator.toUnsafeFloat() * exponential,
      ).toString();
      addFractionalFeeRequest.amountDenominator = denominator.toString();
    } else {
      addFractionalFeeRequest.amountNumerator =
        await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askNumerator'),
          '1',
        );
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

      addFractionalFeeRequest.amountDenominator =
        await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askDenominator'),
          '1',
        );
      await utilsService.handleValidation(
        () => addFractionalFeeRequest.validate('amountDenominator'),
        async () => {
          addFractionalFeeRequest.amountDenominator =
            await utilsService.defaultSingleAsk(
              language.getText('feeManagement.askDenominator'),
              '1',
            );
        },
      );
    }

    addFractionalFeeRequest.min = await utilsService.defaultSingleAsk(
      language.getText('feeManagement.askMin'),
      '0',
    );
    await utilsService.handleValidation(
      () => addFractionalFeeRequest.validate('min'),
      async () => {
        addFractionalFeeRequest.min = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askMin'),
          '0',
        );
      },
    );

    addFractionalFeeRequest.max = await utilsService.defaultSingleAsk(
      language.getText('feeManagement.askMax'),
      '0',
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

    addFractionalFeeRequest.collectorId = await utilsService.defaultSingleAsk(
      language.getText('feeManagement.askCollectorId'),
      '0.0.0',
    );

    await utilsService.handleValidation(
      () => addFractionalFeeRequest.validate('collectorId'),
      async () => {
        addFractionalFeeRequest.collectorId =
          await utilsService.defaultSingleAsk(
            language.getText('feeManagement.askCollectorId'),
            '0.0.0',
          );
      },
    );

    console.log({
      numerator: addFractionalFeeRequest.amountNumerator,
      denominator: addFractionalFeeRequest.amountDenominator,
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

  private async createFixedFee(decimals: number): Promise<void> {
    const addFixedFeeRequest: AddFixedFeeRequest = new AddFixedFeeRequest({
      tokenId: this.stableCoinId,
      amount: '',
      decimals: HBAR_DECIMALS,
      tokenIdCollected: '',
      collectorId: '',
      collectorsExempt: true,
    });

    const feesInHBAR = await utilsService.defaultConfirmAsk(
      language.getText('feeManagement.askHBAR'),
      true,
    );

    addFixedFeeRequest.tokenIdCollected = '0.0.0';

    if (!feesInHBAR) {
      addFixedFeeRequest.tokenIdCollected = await utilsService.defaultSingleAsk(
        language.getText('feeManagement.askTokenId'),
        this.stableCoinId,
      );

      if (addFixedFeeRequest.tokenIdCollected !== this.stableCoinId) {
        const detailsExternalStableCoin =
          await new DetailsStableCoinsService().getDetailsStableCoins(
            addFixedFeeRequest.tokenIdCollected,
            false,
          );

        addFixedFeeRequest.decimals = detailsExternalStableCoin.decimals ?? 0;
      } else addFixedFeeRequest.decimals = decimals;

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
    }

    addFixedFeeRequest.amount = await utilsService.defaultSingleAsk(
      language.getText('feeManagement.askAmount'),
      '0',
    );
    await utilsService.handleValidation(
      () => addFixedFeeRequest.validate('amount'),
      async () => {
        addFixedFeeRequest.amount = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askAmount'),
          '0',
        );
      },
    );

    addFixedFeeRequest.collectorsExempt = await utilsService.defaultConfirmAsk(
      language.getText('feeManagement.askCollectorsExempt'),
      true,
    );

    addFixedFeeRequest.collectorId = await utilsService.defaultSingleAsk(
      language.getText('feeManagement.askCollectorId'),
      '0.0.0',
    );

    await utilsService.handleValidation(
      () => addFixedFeeRequest.validate('collectorId'),
      async () => {
        addFixedFeeRequest.collectorId = await utilsService.defaultSingleAsk(
          language.getText('feeManagement.askCollectorId'),
          '0.0.0',
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

        // Grant role
        //Lists all roles
        const grantRoleRequest = new GrantRoleRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(grantRoleRequest, ['tokenId']);

        grantRoleRequest.role = await this.getRole(stableCoinCapabilities);
        if (
          grantRoleRequest.role !== language.getText('wizard.backOption.goBack')
        ) {
          await utilsService.handleValidation(
            () => grantRoleRequest.validate('role'),
            async () => {
              grantRoleRequest.role = await this.getRole(
                stableCoinCapabilities,
              );
            },
          );

          let grantAccountTargetId = accountTarget;
          grantRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => grantRoleRequest.validate('targetId'),
            async () => {
              grantAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              grantRoleRequest.targetId = grantAccountTargetId;
            },
          );

          try {
            if (grantRoleRequest.role === StableCoinRole.CASHIN_ROLE) {
              await this.grantSupplierRole(grantRoleRequest);
            } else {
              await this.roleStableCoinService.grantRoleStableCoin(
                grantRoleRequest,
              );
            }
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
        break;
      case language.getText('wizard.roleManagementOptions.Revoke'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        // Revoke role
        //Lists all roles
        const revokeRoleRequest = new RevokeRoleRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(revokeRoleRequest, ['tokenId']);

        revokeRoleRequest.role = await this.getRole(stableCoinCapabilities);
        if (
          revokeRoleRequest.role !==
          language.getText('wizard.backOption.goBack')
        ) {
          await utilsService.handleValidation(
            () => revokeRoleRequest.validate('role'),
            async () => {
              revokeRoleRequest.role = await this.getRole(
                stableCoinCapabilities,
              );
            },
          );

          let revokeAccountTargetId = accountTarget;
          revokeRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => revokeRoleRequest.validate('targetId'),
            async () => {
              revokeAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              revokeRoleRequest.targetId = revokeAccountTargetId;
            },
          );

          //Call to SDK
          try {
            await this.roleStableCoinService.revokeRoleStableCoin(
              revokeRoleRequest,
            );
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
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
              increaseCashInLimitRequest.targetId =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
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
              increaseCashInLimitRequest.amount =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.amountIncrease'),
                  '1',
                );
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
            decreaseCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
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
              decreaseCashInLimitRequest.amount =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.amountDecrease'),
                  '1',
                );
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
            resetCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
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
            checkCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
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
      case language.getText('wizard.roleManagementOptions.HasRole'):
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        //Lists all roles
        const hasRoleRequest = new HasRoleRequest({
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(hasRoleRequest, ['tokenId']);

        hasRoleRequest.role = await this.getRole(stableCoinCapabilities);
        if (
          hasRoleRequest.role !== language.getText('wizard.backOption.goBack')
        ) {
          await utilsService.handleValidation(
            () => hasRoleRequest.validate('role'),
            async () => {
              hasRoleRequest.role = await this.getRole(stableCoinCapabilities);
            },
          );

          let hasRoleAccountTargetId = accountTarget;
          hasRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => hasRoleRequest.validate('targetId'),
            async () => {
              hasRoleAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              hasRoleRequest.targetId = hasRoleAccountTargetId;
            },
          );

          //Call to SDK
          try {
            await this.roleStableCoinService.hasRoleStableCoin(hasRoleRequest);
          } catch (error) {
            await utilsService.askErrorConfirmation(
              async () => await this.operationsStableCoin(),
              error,
            );
          }
        }
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

  private async getRole(
    stableCoinCapabilities: StableCoinCapabilities,
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
  }

  private getRolesAccount(): string[] {
    const configAccount = utilsService.getCurrentAccount();
    const importedToken = configAccount.importedTokens.find(
      (token) => token.id === this.stableCoinId,
    );
    return importedToken?.roles;
  }

  private async grantSupplierRole(
    grantRoleRequest: GrantRoleRequest,
  ): Promise<void> {
    const hasRole: boolean = await this.roleStableCoinService.hasRole(
      new HasRoleRequest({
        targetId: grantRoleRequest.targetId,
        tokenId: grantRoleRequest.tokenId,
        role: grantRoleRequest.role,
      }),
    );

    if (hasRole) {
      console.log(language.getText('cashin.alreadyRole'));
    } else {
      let limit = '';
      const supplierRoleType = language.getArrayFromObject(
        'wizard.supplierRoleType',
      );
      grantRoleRequest.supplierType = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askCashInRoleType'),
        supplierRoleType,
      );
      await utilsService.handleValidation(
        () => grantRoleRequest.validate('supplierType'),
        async () => {
          const supplierType = await utilsService.defaultMultipleAsk(
            language.getText('stablecoin.askCashInRoleType'),
            supplierRoleType,
          );
          grantRoleRequest.supplierType = supplierType;
        },
      );

      if (
        grantRoleRequest.supplierType ===
        supplierRoleType[supplierRoleType.length - 1]
      )
        await this.roleManagementFlow();
      if (grantRoleRequest.supplierType === supplierRoleType[0]) {
        //Give unlimited
        //Call to SDK
        grantRoleRequest.supplierType = language.getText(
          'wizard.supplierRoleType.Unlimited',
        );
        await this.roleStableCoinService.giveSupplierRoleStableCoin(
          grantRoleRequest,
        );
      }
      if (grantRoleRequest.supplierType === supplierRoleType[1]) {
        grantRoleRequest.amount = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.supplierRoleLimit'),
          '1',
        );
        await utilsService.handleValidation(
          () => grantRoleRequest.validate('amount'),
          async () => {
            limit = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.supplierRoleLimit'),
              '1',
            );
            grantRoleRequest.amount = limit;
          },
        );

        //Give limited
        //Call to SDK
        grantRoleRequest.supplierType = language.getText(
          'wizard.supplierRoleType.Limited',
        );
        await this.roleStableCoinService.giveSupplierRoleStableCoin(
          grantRoleRequest,
        );
      }
    }
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
