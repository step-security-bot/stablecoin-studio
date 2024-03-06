import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, Generated, PrimaryColumn, Repository } from 'typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Entity()
export class Transaction {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @Column('text')
  transaction_message: string;

  @Column()
  description: string;

  @Column()
  hedera_account_id: string;

  @Column('simple-array')
  signed_messages: string[];

  @Column('simple-array')
  key_list: string[];

  @Column('simple-array')
  signed_keys: string[];

  @Column({
    type: 'enum',
    enum: ['SIGNED', 'PENDING'],
  })
  status: 'SIGNED' | 'PENDING';

  @Column('int')
  threshold: number;
}
//
// @Injectable()
// export class TransactionService {
//   constructor(
//     @InjectRepository(Transaction)
//     private readonly transactionRepository: Repository<Transaction>,
//   ) {}
//
//   public findAll(query: PaginateQuery): Promise<Paginated<Transaction>> {
//     return paginate(query, this.transactionRepository, {
//       sortableColumns: ['id', 'status', 'threshold'],
//       nullSort: 'last',
//       defaultSortBy: [['id', 'DESC']],
//       searchableColumns: [
//         'transaction_message',
//         'description',
//         'hedera_account_id',
//       ],
//       select: [
//         'id',
//         'transaction_message',
//         'description',
//         'hedera_account_id',
//         'status',
//         'threshold',
//       ],
//       filterableColumns: {
//         status: true,
//         threshold: true,
//       },
//     });
//   }
//}
