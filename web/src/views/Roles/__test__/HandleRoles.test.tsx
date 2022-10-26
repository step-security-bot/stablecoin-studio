import userEvent from '@testing-library/user-event';
import HandleRoles from '../HandleRoles';
import type { Action } from '../HandleRoles';
import { render } from '../../../test';
import { roleOptions, fields, actions, cashinLimitOptions } from '../constants';
import { waitFor } from '@testing-library/react';
import { RouterManager } from '../../../Router/RouterManager';
import configureMockStore from 'redux-mock-store';

jest.mock('../../../Router/RouterManager', () => ({
	RouterManager: {
		to: jest.fn(),
	},
}));

const mockStore = configureMockStore();

const validAccount = '0.0.123456';

describe(`<${HandleRoles.name} />`, () => {
	test('should render correctly on all actions', () => {
		Object.keys(actions).forEach((action) => {
			const component = render(<HandleRoles action={action as Action} />);

			expect(component.asFragment()).toMatchSnapshot(action);
		});
	});

	describe(`<${HandleRoles.name} action={${actions.give}}>`, () => {
		test('should has disabled confirm button as default', () => {
			const component = render(<HandleRoles action={actions.give} />);

			const confirmButton = component.getByTestId('confirm-btn');
			expect(confirmButton).toHaveAttribute('disabled');
		});

		test('should enable confirm button after fill form correctly', async () => {
			const store = mockStore({
				wallet: {
					capabilities: ['Cash in'],
					data: {
						savedPairings: [
							{
								accountIds: ['0.0.123456'],
							},
						],
					},
				},
			});

			const component = render(<HandleRoles action={actions.give} />, store);

			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const roles = component.getByTestId('select-placeholder');
			userEvent.click(roles);

			const option = component.getByText(roleOptions[0].label);
			userEvent.click(option);

			expect(roles).not.toBeInTheDocument();

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});
		});

		test('cancel button should redirect to Roles view', () => {
			const component = render(<HandleRoles action={actions.give} />);

			const anything = expect.any(Function);

			const cancelButton = component.getByTestId('cancel-btn');
			userEvent.click(cancelButton);
			expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
		});

		test('should enable confirm button with cash in role and finite tokens to add', async () => {
			const store = mockStore({
				wallet: {
					capabilities: ['Cash in'],
					data: {
						savedPairings: [
							{
								accountIds: ['0.0.123456'],
							},
						],
					},
				},
			});

			const component = render(<HandleRoles action={actions.give} />, store);

			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const roles = component.getByTestId('select-placeholder');
			userEvent.click(roles);

			const option = component.getByText(roleOptions[0].label);
			userEvent.click(option);

			expect(roles).not.toBeInTheDocument();

			expect(component.getByTestId('supplier-quantity')).toBeInTheDocument();

			const supplierQuantitySwitch = component.getByTestId(fields.supplierQuantitySwitch);
			userEvent.click(supplierQuantitySwitch);

			const amount = component.getByTestId('input-supplier-quantity');
			expect(amount).toBeInTheDocument();
			userEvent.type(amount, '1000');

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});

			const modalConfirmButton = component.getByTestId('modal-action-confirm-button');
			userEvent.click(modalConfirmButton);
		});

		test('should call SDK when click on confirm button', async () => {
			const store = mockStore({
				wallet: {
					capabilities: ['Cash in'],
					data: {
						savedPairings: [
							{
								accountIds: ['0.0.123456'],
							},
						],
					},
					selectedStableCoin: {
						tokenId: '0.0.123456',
						totalSupply: 10000,
						memo: {
							proxyContract: '0.0.123456',
						},
					},
				},
			});

			const component = render(<HandleRoles action={actions.give} />, store);

			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const roles = component.getByTestId('select-placeholder');
			userEvent.click(roles);

			const option = component.getByText(roleOptions[0].label);
			userEvent.click(option);

			expect(roles).not.toBeInTheDocument();

			expect(component.getByTestId('supplier-quantity')).toBeInTheDocument();

			const supplierQuantitySwitch = component.getByTestId(fields.supplierQuantitySwitch);
			userEvent.click(supplierQuantitySwitch);

			const amount = component.getByTestId('input-supplier-quantity');
			expect(amount).toBeInTheDocument();
			userEvent.type(amount, '1000');

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});

			const modalConfirmButton = component.getByTestId('modal-action-confirm-button');
			userEvent.click(modalConfirmButton);
		});
	});

	describe(`<${HandleRoles.name} action={${actions.revoke}}>`, () => {
		test('should has disabled confirm button as default', () => {
			const component = render(<HandleRoles action={actions.revoke} />);

			const anything = expect.any(Function);

			const cancelButton = component.getByTestId('cancel-btn');
			userEvent.click(cancelButton);
			expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
		});

		test('should enable confirm button after fill form correctly', async () => {
			const store = mockStore({
				wallet: {
					capabilities: ['Cash in'],
					data: {
						savedPairings: [
							{
								accountIds: ['0.0.123456'],
							},
						],
					},
				},
			});

			const component = render(<HandleRoles action={actions.revoke} />, store);

			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const roles = component.getByTestId('select-placeholder');
			userEvent.click(roles);

			const option = component.getByText(roleOptions[0].label);
			userEvent.click(option);

			expect(roles).not.toBeInTheDocument();

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});

			const modalConfirmButton = component.getByTestId('modal-action-confirm-button');
			userEvent.click(modalConfirmButton);
		});

		test('cancel button should redirect to Roles view', () => {
			const component = render(<HandleRoles action={actions.revoke} />);

			const anything = expect.any(Function);

			const cancelButton = component.getByTestId('cancel-btn');
			userEvent.click(cancelButton);
			expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
		});
	});

	describe(`<${HandleRoles.name} action={${actions.edit}}>`, () => {
		test('should has disabled confirm button as default', () => {
			const component = render(<HandleRoles action={actions.edit} />);

			const anything = expect.any(Function);

			const cancelButton = component.getByTestId('cancel-btn');
			userEvent.click(cancelButton);
			expect(RouterManager.to).toHaveBeenCalledWith(anything, 'roles');
		});

		test('should enable confirm button with increase cash in limit', async () => {
			const store = mockStore({
				wallet: {
					capabilities: ['Cash in'],
					data: {
						savedPairings: [
							{
								accountIds: ['0.0.123456'],
							},
						],
					},
					selectedStableCoin: {
						totalSupply: 10000,
					},
				},
			});

			const component = render(<HandleRoles action={actions.edit} />, store);

			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const optionPlaceholder = component.getByTestId('select-placeholder');
			userEvent.click(optionPlaceholder);

			const option = component.getByText(cashinLimitOptions[0].label);
			userEvent.click(option);

			expect(optionPlaceholder).not.toBeInTheDocument();

			const amount = component.getByTestId(fields.amount);
			expect(amount).toBeInTheDocument();
			userEvent.type(amount, '100');

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});

			const modalConfirmButton = component.getByTestId('modal-action-confirm-button');
			userEvent.click(modalConfirmButton);
		});

		test('should enable confirm button with check cash in limit', async () => {
			const store = mockStore({
				wallet: {
					capabilities: ['Cash in'],
					data: {
						savedPairings: [
							{
								accountIds: ['0.0.123456'],
							},
						],
					},
					selectedStableCoin: {
						totalSupply: 10000,
					},
				},
			});

			const component = render(<HandleRoles action={actions.edit} />, store);

			const account = component.getByTestId(fields.account);
			userEvent.type(account, validAccount);

			const optionPlaceholder = component.getByTestId('select-placeholder');
			userEvent.click(optionPlaceholder);

			const option = component.getByText(cashinLimitOptions[3].label);
			userEvent.click(option);

			const confirmButton = component.getByTestId('confirm-btn');

			await waitFor(() => {
				expect(confirmButton).not.toHaveAttribute('disabled');
				userEvent.click(confirmButton);
			});
		});
	});
});
