import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

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

  @Column('text', { array: true })
  signed_messages: string[];

  @Column('text', { array: true })
  key_list: string[];

  @Column('text', { array: true })
  signed_keys: string[];

  @Column({
    type: 'enum',
    enum: ['SIGNED', 'PENDING'],
  })
  status: 'SIGNED' | 'PENDING';

  @Column('int')
  threshold: number;
}
