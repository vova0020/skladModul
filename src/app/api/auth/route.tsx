// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prismaInteraction from '@/api/prisma';
import jwt from "jsonwebtoken"; // Импортируем библиотеку jsonwebtoken
import dotenv from "dotenv"; // Импортируйте dotenv

dotenv.config(); // Загрузите переменные окружения из .env

const prisma = new prismaInteraction();
const SECRET_KEY = process.env.SECRET_KEY; // Убедитесь, что ключ безопасен и хранится в переменных окружения

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY не установлен в переменных окружения");
}

export async function POST(req: NextRequest) {
    try {
        const { login, password } = await req.json();

        // Проверка существующего пользователя
        const user = await prisma.findUserByLogin(login);

        if (!user) {
            return NextResponse.json({ message: "Неверный логин или пароль" }, { status: 401 });
        }

        // Проверка пароля
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ message: "Неверный логин или пароль" }, { status: 401 });
        }

        // Создаем токен
        const token = jwt.sign(
            { login: user.login, roleId: user.roleId, firstName: user.firstName, lastName: user.lastName, id: user.id },
            SECRET_KEY,
            { expiresIn: "1h" } // Устанавливаем срок действия токена
        );

        // Возвращаем успешный ответ с токеном
        return NextResponse.json({ message: "Успешная авторизация", token }, { status: 200 });
    } catch (error) {
        console.error("Ошибка при авторизации:", error);
        return NextResponse.json({ message: "Ошибка при авторизации" }, { status: 500 });
    }
}
