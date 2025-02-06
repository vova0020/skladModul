/* eslint-disable */
// @ts-nocheck
// @ts-ignore
import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть


export async function POST(req: NextRequest) {
  try {
      const data = await req.json(); // Парсинг тела запроса
      console.log(data);

      
      // Создаем запись о списании инструмента
      const newTransaction = await prisma.createInstrumentTransactionRemontOF(data);

      // Проверяем, что операция завершилась успешно
      if (!newTransaction) {
          throw new Error('Не удалось создать запись о получении инструмента');
      }

      // Возвращаем успешный ответ
      return NextResponse.json(
          { message: 'Инструмент успешно добавлен!', transaction: newTransaction }, // Сообщение об успехе и данные транзакции
          { status: 201 } // Статус 201 (Created)
      );
  } catch (error) {
      console.error('Ошибка при создании записи о списании инструмента:', error);
      return NextResponse.json(
          { message: error.message || 'Ошибка при создании записи о списании инструмента' },
          { status: 500 }
      );
  }
}