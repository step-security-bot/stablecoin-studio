// import { Transaction } from './transaction.entity';
// import {
//   FilterOperator,
//   PaginateConfig,
//   PaginationType,
// } from 'nestjs-paginate';
//
// const transactionPaginateConfig: PaginateConfig<Transaction> = {
//   sortableColumns: ['id', 'status', 'hedera_account_id', 'threshold'],
//
//   defaultSortBy: [['status', 'ASC']],
//
//   searchableColumns: ['signed_keys', 'key_list', 'status'],
//
//   select: [
//     'id',
//     'status',
//     'hedera_account_id',
//     'signed_keys',
//     'key_list',
//     'threshold',
//   ],
//
//   maxLimit: 20,
//
//   defaultLimit: 10,
//
//   filterableColumns: {
//     status: [FilterOperator.EQ],
//   },
//
//   relations: [],
//
//   loadEagerRelations: true,
//
//   paginationType: PaginationType.LIMIT_AND_OFFSET,
//
//   relativePath: false,
//
//   //TODO: replace by url of the frontend
//   // origin: 'http://transactions.example',
//
//   ignoreSearchByInQueryParam: true,
//
//   ignoreSelectInQueryParam: true,
// };
