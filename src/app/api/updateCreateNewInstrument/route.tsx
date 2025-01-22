import { NextRequest, NextResponse } from "next/server";
import prismaInteraction from '@/api/prisma';

const prisma = new prismaInteraction();
export const dynamic = 'force-dynamic'; // показывает что фаил должен динамический быть
import fs from 'fs';
import path from 'path';

const saveFile = async (file: File): Promise<string> => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'drawings'); // Путь к папке public/uploads/drawings
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true }); // Создаем папку, если она не существует
    }

    const filePath = path.join(uploadDir, file.name); // Полный путь к файлу
    const buffer = await file.arrayBuffer(); // Читаем файл как ArrayBuffer
    fs.writeFileSync(filePath, Buffer.from(buffer)); // Сохраняем файл на сервере

    return `/uploads/drawings/${file.name}`; // Возвращаем путь к файлу (относительно папки public)
};


export async function POST(req: NextRequest) {
    try {
        const data = await req.formData(); // Используем FormData для работы с файлами
        const name = data.get('name') as string;
        const type = data.get('type') as string;
        const userId = Number(data.get('userId')); // Преобразуем userId в число
        const quantity = Number(data.get('quantity')); // Преобразуем quantity в число
        const storageCellsData = JSON.parse(data.get('storageCellsData') as string); // Массив объектов { storageCellId: number, quantity: number }
        const machineIds = JSON.parse(data.get('machineIds') as string) as number[];
        const file = data.get('file') as File | null;

        // Проверяем, что storageCellsData содержит числа
        if (!Array.isArray(storageCellsData) || !storageCellsData.every(cell =>
            typeof cell.storageCellId === 'number' && typeof cell.quantity === 'number'
        )) {
            throw new Error('Некорректные данные для ячеек хранения');
        }

        // Сохраняем файл и получаем путь (если файл передан)
        let fileData = null;
        if (file) {
            const filePath = await saveFile(file);
            fileData = { name: file.name, filePath }; // Формируем объект с именем и путем
        }

        // Создаем объект для передачи в Prisma
        const instrumentData = {
            name,
            type,
            userId,
            quantity,
            storageCellsData, // Массив ячеек хранения и количеств
            machineIds, // Массив ID станков
            file: fileData, // Передаем объект с именем и путем (или null, если файла нет)
        };

        // Логирование данных перед отправкой
        console.log('Данные для отправки:', instrumentData);

        // Вызываем метод Prisma для создания инструмента
        const newInstrument = await prisma.createAdminInstrumentUser(instrumentData);

        return NextResponse.json(newInstrument, { status: 201 });
    } catch (error) {
        console.error('Ошибка при создании инструмента:', error);
        return NextResponse.json({ message: 'Ошибка при создании инструмента' }, { status: 500 });
    }
}