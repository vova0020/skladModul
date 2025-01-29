import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть

// // GET-запрос для получения данных
// export async function GET() {
//     try {
//         const newOrder = await prisma.getAdminStanock();

//         // console.log(newOrder);
        

//         return NextResponse.json(newOrder, { status: 200 });
//     } catch (error) {
//         console.error('Ошибка при создании Заявки:', error);
//         return NextResponse.json({ message: 'Ошибка при создании Заявки' }, { status: 500 });
//     }
// }

// export async function PUT(req: NextRequest) {
//     try {
//         const {stanockId, name, productId, sectionId} = await req.json();
//         console.log(name);
//         // console.log(formData);
        
//         // Обновляем запись в базе данных с помощью Prisma
//         const updatedSectors = await prisma.putAdminStanock(stanockId, name, productId,sectionId);

//         return NextResponse.json(updatedSectors, { status: 200 });
//     } catch (error) {
//         console.error('Ошибка при обновлении Участка:', error);
//         return NextResponse.json({ message: 'Ошибка при обновлении Участка' }, { status: 500 });
//     }
// }
// export async function DELETE(req: NextRequest) {
//     try {
//         const {stanockId} = await req.json();
//         console.log(stanockId);
//         // console.log(formData);
        
//         // Обновляем запись в базе данных с помощью Prisma
//         const updatedSectors = await prisma.delAdminStanock(stanockId);

//         return NextResponse.json(updatedSectors, { status: 200 });
//     } catch (error) {
//         console.error('Ошибка при обновлении Участка:', error);
//         return NextResponse.json({ message: 'Ошибка при обновлении Участка' }, { status: 500 });
//     }
// }

export async function POST(req: NextRequest) {
  try {
      const data = await req.json(); // Парсинг тела запроса
      console.log(data);

     

      // Создаем запись о списании инструмента
      const newTransaction = await prisma.createInstrumentTransactionSpisanie(data);

      // Проверяем, что операция завершилась успешно
      if (!newTransaction) {
          throw new Error('Не удалось создать запись о списании инструмента');
      }

      // Возвращаем успешный ответ
      return NextResponse.json(
          { message: 'Инструмент успешно списан!', transaction: newTransaction }, // Сообщение об успехе и данные транзакции
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