import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create-transaction-response.dto';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { UpdateTransactionRequestDto } from './dto/update-transaction-request.dto';

@Controller('/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async addTransaction(
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    const transaction: Transaction =
      await this.transactionService.create(createTransactionDto);
    return new CreateTransactionResponseDto(transaction.id);
  }

  @Put(':transactionId')
  @HttpCode(HttpStatus.OK) // 200 OK
  async updateTransaction(
    @Param('transactionId') transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionRequestDto,
  ): Promise<void> {
    await this.transactionService.update(updateTransactionDto, transactionId);
  }

  @Delete(':transactionId')
  @HttpCode(HttpStatus.OK) // 200 OK
  async deleteTransaction(
    @Param('transactionId') transactionId: string,
  ): Promise<void> {
    await this.transactionService.delete(transactionId);
  }

  @Get()
  @HttpCode(HttpStatus.OK) // 200 OK
  async getTransactions(): Promise<Transaction[]> {
    return await this.transactionService.getAll();
  }
}
