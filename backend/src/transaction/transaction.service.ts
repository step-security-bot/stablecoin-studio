import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import { Transaction } from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { Repository } from 'typeorm';
import { getTransactionsResponseDto } from './dto/get-transactions-response.dto';
import { paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionRequestDto,
  ): Promise<Transaction> {
    const emptyStringArray: string[] = [];
    const transaction: Transaction = this.transactionRepository.create({
      transaction_message: createTransactionDto.transaction_message,
      description: createTransactionDto.description,
      hedera_account_id: createTransactionDto.hedera_account_id,
      key_list: createTransactionDto.key_list,
      signed_keys: emptyStringArray,
      status: 'PENDING',
      threshold:
        createTransactionDto.threshold === 0
          ? createTransactionDto.key_list.length
          : createTransactionDto.threshold,
      signed_messages: emptyStringArray,
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async sign(
    signTransactionDto: SignTransactionRequestDto,
    transactionId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (transaction) {
      if (transaction.signed_keys.includes(signTransactionDto.public_key)) {
        throw new Error('message already signed');
      }
      if (!transaction.key_list.includes(signTransactionDto.public_key)) {
        throw new Error('Key not found');
      }
      transaction.signed_keys = [
        ...transaction.signed_keys,
        signTransactionDto.public_key,
      ];
      if (transaction.signed_keys.length >= transaction.threshold) {
        transaction.status = 'SIGNED';
      }
      transaction.signed_messages = [
        ...transaction.signed_messages,
        signTransactionDto.signed_transaction_message,
      ];
      await this.transactionRepository.save(transaction);
      return transaction;
    } else {
      throw new Error('Transaction not found');
    }
  }

  async delete(transactionId: string): Promise<void> {
    await this.transactionRepository.delete({ id: transactionId });
  }

  // async getSignedTransactionsBy(
  //   publicKey: string,
  // ): Promise<getTransactionsResponseDto[]> {
  //   const transactions = await this.transactionRepository.find({
  //     where: { signed_keys: publicKey },
  //   });
  //
  //   return transactions.map((transaction: Transaction) => {
  //     return new getTransactionsResponseDto(
  //       transaction.id,
  //       transaction.transaction_message,
  //       transaction.description,
  //       transaction.status,
  //       transaction.threshold,
  //       transaction.key_list,
  //       transaction.signed_keys,
  //     );
  //   });
  // }
  //
  // async getPendingTransactionsFor(
  //   publicKey: string,
  // ): Promise<getTransactionsResponseDto[]> {
  //   const transactions = await this.transactionRepository.find({
  //     where: { key_list: publicKey, status: 'PENDING' },
  //   });
  //
  //   return transactions.map((transaction: Transaction) => {
  //     return new getTransactionsResponseDto(
  //       transaction.id,
  //       transaction.transaction_message,
  //       transaction.description,
  //       transaction.status,
  //       transaction.threshold,
  //       transaction.key_list,
  //       transaction.signed_keys,
  //     );
  //   });
  // }
  //
  // async getAllTransactions(
  //   query: PaginateQuery,
  // ): Promise<Paginated<Transaction>> {
  //   return paginate(query, this.transactionRepository, {
  //     sortableColumns: ['id', 'status'], // Ejemplo de columnas por las que se puede ordenar
  //     defaultSortBy: [['status', 'DESC']], // Orden predeterminado
  //     searchableColumns: ['transaction_message', 'description'], // Ejemplo de columnas que se pueden buscar
  //     filterableColumns: {
  //       status: true,
  //     },
  //     select: [
  //       'id',
  //       'transaction_message',
  //       'description',
  //       'status',
  //       'threshold',
  //       'key_list',
  //       'signed_keys',
  //     ],
  //   });
  // }

  async findAll(
    query: PaginateQuery,
    publicKey?: string,
    status?: string,
  ): Promise<Paginated<Transaction>> {
    const filters: any = {}; // Objeto para construir dinámicamente los filtros

    // Agregar filtro por publicKey si está presente
    if (publicKey) {
      // Aquí necesitas definir la lógica para determinar si filtrar por 'signed_keys' o 'key_list'
      // Por ejemplo, podrías tener un parámetro adicional para especificar el tipo de filtro
      filters.signed_keys = publicKey; // O filters.key_list = publicKey, dependiendo de tu lógica
    }

    // Agregar filtro por estado si está presente
    if (status) {
      filters.status = status;
    }

    return paginate(query, this.transactionRepository, {
      where: filters,
      sortableColumns: ['id', 'status'],
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['transaction_message', 'description'],
      filterableColumns: {
        status: true,
      },
    });
  }
}
