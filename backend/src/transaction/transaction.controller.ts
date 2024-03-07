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
  Query,
} from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create-transaction-response.dto';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import { TransactionService } from './transaction.service';
import { Transaction } from './transaction.entity';
import { SignTransactionRequestDto } from './dto/sign-transaction-request.dto';
import { getTransactionsResponseDto } from './dto/get-transactions-response.dto';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Transactions')
@Controller('/api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  @ApiCreatedResponse({
    description: 'The transaction has been successfully created.',
    type: CreateTransactionResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addTransaction(
    @Body() createTransactionDto: CreateTransactionRequestDto,
  ): Promise<CreateTransactionResponseDto> {
    const transaction: Transaction =
      await this.transactionService.create(createTransactionDto);
    return new CreateTransactionResponseDto(transaction.id);
  }

  @Put(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content (successful update, no response body needed
  async signTransaction(
    @Param('transactionId') transactionId: string,
    @Body() signTransactionDto: SignTransactionRequestDto,
  ): Promise<void> {
    await this.transactionService.sign(signTransactionDto, transactionId);
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
  async getTransactions(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Transaction>> {
    return this.transactionService.findAll(query);
  }
}
