import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export default class prismaInteraction {
    // Функция авторизации
    async findUserByLogin(login: string) {
        return await prisma.user.findUnique({
            where: { login },
        });

    }

    // Получение причин ролей
    async getRole() {
        try {
            const requestData = await prisma.role.findMany();
            // console.log(JSON.stringify(requestData, null, 2));

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка ролей:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }


    //  Создание пользователя
    async createUser(data: { firstName: string, lastName: string, login: string; password: string; role: number; }) {
        console.log(data);

        // Проверка, существует ли пользователь с таким логином
        const existingUser = await prisma.user.findUnique({
            where: { login: data.login }, // Проверяем по полю login
        });

        if (existingUser) {
            throw new Error('USER_EXISTS'); // Меняем текст ошибки на ключевое значение
        }

        // Формируем объект данных для создания пользователя
        const userData: any = {
            firstName: data.firstName,
            lastName: data.lastName,
            login: data.login,
            password: data.password,
            role: { connect: { id: data.role } },
        };


        // Сохраняем пользователя
        const newUser = await prisma.user.create({ data: userData });

        return newUser; // Возвращаем созданного пользователя
    };



    // Получение списка пользователей
    async getAdminUsers() {
        try {
            const requestData = await prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    login: true,
                    role: { select: { id: true, name: true } },   // Выбираем только id и name для роли

                }
            });
            // console.log(JSON.stringify(requestData, null, 2));


            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка участков:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // // Изменение Названия участка
    // async putAdminUsers(sectorId: number, data: any) {
    //     try {
    //         // Проверяем, является ли data массивом или одним числом
    //         if (Array.isArray(data)) {
    //             // Если это массив, обновляем каждый станок по отдельности
    //             const updatedSectors = await prisma.machine.updateMany({
    //                 where: {
    //                     id: { in: data }, // Фильтруем по массиву id
    //                 },
    //                 data: {
    //                     masterId: sectorId,
    //                 },
    //             });

    //             return updatedSectors;
    //         } else {
    //             // Если это одно число, обновляем только один станок
    //             const updatedSector = await prisma.machine.update({
    //                 where: { id: data }, // Используем одно значение
    //                 data: {
    //                     userId: sectorId,
    //                 },
    //             });

    //             return updatedSector;
    //         }
    //     } catch (error) {
    //         console.error("Ошибка при обновлении статуса станка:", error);
    //         throw error;
    //     } finally {
    //         await prisma.$disconnect();
    //     }
    // }

    // Удаление  участка
    async delAdminUsers(sectorId: number) {
        try {
            // Удаление записи из таблицы section
            const deletedSector = await prisma.user.delete({
                where: { id: sectorId },
            });

            return deletedSector;
        } catch (error) {
            console.error('Ошибка при удалении участка:', error);
            throw new Error('Ошибка при удалении участка');
        } finally {
            await prisma.$disconnect();
        }
    }


    // Получение списка ячеек ===============================
    async getAdminCell() {
        try {
            const requestData = await prisma.storageCells.findMany({
                include: {
                    toolCell: true,
                }
            });
            // console.log(JSON.stringify(requestData, null, 2));

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка ячеек:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // Изменение Названия участка
    async putAdminCell(sectorId: number, name: string) {
        try {

            // Шаг 2: Обновить статус станка
            const updatedSectors = await prisma.storageCells.update({
                where: { id: sectorId },
                data: {
                    name: name, // Обновляем статус
                },
            })

            return updatedSectors;
        } catch (error) {
            console.error("Ошибка при обновлении статуса ячеек:", error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Удаление  участка
    async delAdminCell(sectorId: number) {
        try {
            // Удаление записи из таблицы section
            const deletedSector = await prisma.storageCells.delete({
                where: { id: sectorId },
            });

            return deletedSector;
        } catch (error) {
            console.error('Ошибка при удалении ячеек:', error);
            throw new Error('Ошибка при удалении ячеек');
        } finally {
            await prisma.$disconnect();
        }
    }
    //   Добавление новых записей
    async createAdminCell(data: any) {
        try {
            // Создаем запись для output
            const requestSectors = await prisma.storageCells.create({
                data: {
                    name: data.name,
                }
            });

            // Возвращаем как записи output, так и записи downtime
            return {
                output: requestSectors,

            };
        } catch (error) {
            console.error('Ошибка при добавлении данных ячеек:', error);
            throw error;
        } finally {
            await prisma.$disconnect(); // Закрытие соединения с базой данных
        }
    }

    // Получение списка изделий ===============================
    async getAdminProducts() {
        try {
            const requestData = await prisma.product.findMany();
            // console.log(JSON.stringify(requestData, null, 2));

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка изделия:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // Изменение Названия участка
    async putAdminProducts(sectorId: number, name: string) {
        try {

            // Шаг 2: Обновить статус станка
            const updatedSectors = await prisma.product.update({
                where: { id: sectorId },
                data: {
                    name: name,
                },
            })

            return updatedSectors;
        } catch (error) {
            console.error("Ошибка при обновлении статуса изделия:", error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Удаление  изделия
    async delAdminProducts(sectorId: number) {
        try {
            // Удаление записи из таблицы изделия
            const deletedSector = await prisma.product.delete({
                where: { id: sectorId },
            });

            return deletedSector;
        } catch (error) {
            console.error('Ошибка при удалении изделия:', error);
            throw new Error('Ошибка при удалении изделия');
        } finally {
            await prisma.$disconnect();
        }
    }
    //   Добавление новых записей
    async createAdminProducts(data: any) {
        try {
            // Создаем запись для output
            const requestSectors = await prisma.product.create({
                data: {
                    name: data.name,
                }
            });

            // Возвращаем как записи output, так и записи downtime
            return {
                output: requestSectors,

            };
        } catch (error) {
            console.error('Ошибка при добавлении данных:', error);
            throw error;
        } finally {
            await prisma.$disconnect(); // Закрытие соединения с базой данных
        }
    }


    // Получение списка станков ===========================
    async getAdminStanock() {
        try {
            const requestData = await prisma.machine.findMany({
                include: {

                    // Включаем связь с Product через MachineProduct
                    product: {
                        include: {
                            product: true
                        }
                    },
                    // Включаем связь с Instrument через MachineInstrument
                    instrument: {
                        include: {
                            instrument: true
                        }
                    },
                    transactions: true
                }
            });

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка станков:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // Изменение станка
    async putAdminStanock(stanockId: number, name: string, productId: number[],) {
        try {
            // Обновляем данные станка
            const machineData = {
                name: name,

            };

            // Обновляем связи с изделиями
            const updatedSectors = await prisma.machine.update({
                where: { id: stanockId },
                data: {
                    ...machineData,
                    product: {
                        // Удаляем старые связи
                        deleteMany: {},
                        // Создаём новые связи
                        create: productId.map((productId) => ({
                            product: { connect: { id: productId } },
                        })),
                    },
                },
                include: {
                    product: true, // Включаем связанные изделия в ответ
                },
            });

            return updatedSectors;
        } catch (error) {
            console.error("Ошибка при обновлении станка:", error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Удаление  станка
    async delAdminStanock(stanockId: number) {
        try {
            // Удаляем станок
            const deletedSector = await prisma.machine.delete({
                where: { id: stanockId },
            });

            return deletedSector;
        } catch (error) {
            console.error('Ошибка при удалении станка:', error);
            throw new Error('Ошибка при удалении станка');
        } finally {
            await prisma.$disconnect();
        }
    }

    async createAdminStanock(data: any) {
        console.log(data);

        try {
            // Создаем запись для станка
            const newMachine = await prisma.machine.create({
                data: {
                    name: data.name,

                    product: {
                        create: data.productId.map((productId: number) => ({
                            product: { connect: { id: productId } }, // Связь с изделиями
                        })),
                    },
                },
                include: {
                    product: true, // Включаем связанные изделия в ответ
                },
            });

            // Возвращаем созданный станок
            return {
                machine: newMachine,
            };
        } catch (error) {
            console.error('Ошибка при добавлении данных:', error);
            throw error;
        } finally {
            await prisma.$disconnect(); // Закрытие соединения с базой данных
        }
    }

    // Получение списка инструментов ===========================
    async getAdminInstrument() {
        try {
            const requestData = await prisma.instrument.findMany({
                include: {
                    drawing: true,
                    // Включаем связь с Product через MachineProduct
                    machines: {
                        include: {
                            machine: true
                        }
                    },
                    // Включаем связь с Instrument через MachineInstrument
                    toolCell: {
                        include: {
                            storageCells: true
                        }
                    },
                    transactions: true
                }
            });

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка станков:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // Изменение станка
    async putAdminInstrument(
        instrumentId: number,
        name: string,

        storageCellsData: { storageCellId: number; quantity: number }[],
        machineIds: number[],
        file: { name: string; filePath: string } | null
    ) {
        try {
            // Пересчитываем общее количество инструментов
            const totalQuantity = storageCellsData.reduce(
                (sum, cell) => sum + cell.quantity,
                0
            );
            console.log(totalQuantity);


            // Обновляем данные инструмента
            const updatedInstrument = await prisma.instrument.update({
                where: { id: instrumentId },
                data: {
                    name,
                    quantity: totalQuantity, // Обновляем общее количество
                    machines: {
                        // Удаляем старые связи
                        deleteMany: {},
                        // Создаем новые связи
                        create: machineIds.map((machineId) => ({
                            machine: { connect: { id: machineId } },
                        })),
                    },
                    toolCell: {
                        // Удаляем старые связи
                        deleteMany: {},
                        // Создаем новые связи
                        create: storageCellsData.map((cell) => ({
                            storageCells: { connect: { id: cell.storageCellId } },
                            quantity: cell.quantity,
                        })),
                    },
                    drawing: file
                        ? {
                            // Обновляем или создаем чертеж
                            upsert: {
                                create: {
                                    name: file.name,
                                    filePath: file.filePath,
                                },
                                update: {
                                    name: file.name,
                                    filePath: file.filePath,
                                },
                            },
                        }
                        : undefined, // Если файл не передан, чертеж не обновляется
                },
                include: {
                    machines: {
                        include: {
                            machine: true,
                        },
                    },
                    toolCell: {
                        include: {
                            storageCells: true,
                        },
                    },
                    drawing: true,
                },
            });

            return updatedInstrument;
        } catch (error) {
            console.error('Ошибка при обновлении инструмента:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Удаление  станка
    async delAdminInstrument(stanockId: number) {
        try {
            // Удаляем станок
            const deletedSector = await prisma.machine.delete({
                where: { id: stanockId },
            });

            return deletedSector;
        } catch (error) {
            console.error('Ошибка при удалении станка:', error);
            throw new Error('Ошибка при удалении станка');
        } finally {
            await prisma.$disconnect();
        }
    }

    // Функция для создания инструмента
    async createAdminInstrument(data: any) {
        try {
            console.log('Данные для создания инструмента:', {
                name: data.name,

                storageCellsData: data.storageCellsData,
                machineIds: data.machineIds,
                file: data.file,
            });

            // Проверка наличия необходимых полей
            if (!data.name || !data.storageCellsData || !data.machineIds) {
                throw new Error('Некорректные данные для создания инструмента');
            }

            // Вычисление общего количества инструментов
            const totalQuantity = data.storageCellsData.reduce((sum, cell) => {
                return sum + cell.quantity;
            }, 0);

            // Создание инструмента
            const newInstrument = await prisma.instrument.create({
                data: {
                    name: data.name,
                    quantity: totalQuantity, // Установка общего количества
                    machines: {
                        create: data.machineIds.map((machineId: number) => ({
                            machine: { connect: { id: machineId } },
                        })),
                    },
                    toolCell: {
                        create: data.storageCellsData.map((cell: { storageCellId: number; quantity: number }) => ({
                            storageCells: { connect: { id: cell.storageCellId } },
                            quantity: cell.quantity,
                        })),
                    },
                    drawing: data.file ? {
                        create: {
                            name: data.file.name,
                            filePath: data.file.filePath,
                        },
                    } : undefined,
                },
                include: {
                    toolCell: {
                        include: {
                            storageCells: true,
                        },
                    },
                    machines: {
                        include: {
                            machine: true,
                        },
                    },
                    drawing: true,
                },
            });

            return newInstrument;
        } catch (error) {
            console.error('Ошибка при добавлении инструмента:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Функция для расчета сколько отдали и сколько вернули
    async updateSummary(
        instrumentId: number,
        type: 'issue' | 'return' | 'returnedInWrittenOff' | 'sendWriteOff' | 'write_off' | 'repair',
        quantity: number,
        machineId?: number | null,
    ) {
        // ТИпы операций
        // issue - выдача инструмента
        // return - возврат на баланс
        // returnedInWrittenOff - возврат на списание
        // sendWriteOff - Отправить на списание
        // write_off - списание со склада
        // repair - списание инструмента который подготовлен к списанию


        // Используем upsert для обновления или создания записи

        if (type == 'issue' || type == 'return') {

            const summary2 = await prisma.instrumentSummary.upsert({
                where: {
                    instrumentId_machineId: {
                        instrumentId,

                        machineId: machineId || null,
                    },
                },
                update: {
                    totalIssued:
                        type === 'issue' ? { increment: quantity } :
                            type === 'return' ? { decrement: quantity } :
                                undefined,
                },
                create: {
                    instrumentId,

                    machineId: machineId || null,
                    totalIssued: type === 'issue' ? quantity : 0,

                },
            });
            // Проверяем, существует ли запись с указанным instrumentId
            const existingSummary = await prisma.instrumentSummaryWriteOffRepair.findUnique({
                where: {
                    instrumentId: instrumentId, // Поиск по instrumentId
                },
            });

            let summary;

            if (existingSummary) {
                // Если запись существует, обновляем ее
                summary = await prisma.instrumentSummaryWriteOffRepair.update({
                    where: {
                        instrumentId: instrumentId, // Обновляем по instrumentId
                    },
                    data: {
                        totalIssuedCeh: type === 'issue' ? { increment: quantity } : type === 'return' ? { decrement: quantity } :
                            undefined,

                    },
                });
            } else {
                // Если запись не существует, создаем ее   

                summary = await prisma.instrumentSummaryWriteOffRepair.create({
                    data: {
                        instrumentId,
                        totalIssuedCeh: type === 'issue' ? quantity : 0,

                    },
                });
            }


            return { summary, summary2 }
        } else if (type == 'returnedInWrittenOff' || type == 'sendWriteOff') {

            // Проверяем, существует ли запись с указанным instrumentId
            const existingSummary = await prisma.instrumentSummaryWriteOffRepair.findUnique({
                where: {
                    instrumentId: instrumentId, // Поиск по instrumentId
                },
            });

            let summary;

            if (existingSummary) {
                // Если запись существует, обновляем ее
                summary = await prisma.instrumentSummaryWriteOffRepair.update({
                    where: {
                        instrumentId: instrumentId, // Обновляем по instrumentId
                    },
                    data: {
                        totalReturnedInWrittenOff: type === 'returnedInWrittenOff' ? { increment: quantity } :
                            type === 'sendWriteOff' ? { increment: quantity } : undefined,
                    },
                });
            } else {
                // Если запись не существует, создаем ее
                // Для типа 'repairOff' нельзя создать запись, так как totalRemont не может быть отрицательным

                summary = await prisma.instrumentSummaryWriteOffRepair.create({
                    data: {
                        instrumentId,
                        totalReturnedInWrittenOff: type === 'returnedInWrittenOff' ? quantity : type === 'sendWriteOff' ? quantity : 0,
                    },
                });
            }
            return { summary }

        } else if (type == 'repair') {
            // Проверяем, существует ли запись с указанным instrumentId
            const existingSummary = await prisma.instrumentSummaryWriteOffRepair.findUnique({
                where: {
                    instrumentId: instrumentId, // Поиск по instrumentId
                },
            });

            let summary;

            if (existingSummary) {
                // Если запись существует, обновляем ее
                summary = await prisma.instrumentSummaryWriteOffRepair.update({
                    where: {
                        instrumentId: instrumentId, // Обновляем по instrumentId
                    },
                    data: {
                        totalReturnedInWrittenOff: type === 'repair' ? { decrement: quantity } : undefined,
                        totalWrittenOff: type === 'repair' ? { increment: quantity } : undefined,
                    },
                });
            } else {
                // Если запись не существует, создаем ее
                // Для типа 'repairOff' нельзя создать запись, так как totalRemont не может быть отрицательным

                summary = await prisma.instrumentSummaryWriteOffRepair.create({
                    data: {
                        instrumentId,
                        totalWrittenOff: type === 'repair' ? quantity : 0,
                    },
                });
            }
            return { summary }
        } else if (type == 'write_off') {
            // Проверяем, существует ли запись с указанным instrumentId
            const existingSummary = await prisma.instrumentSummaryWriteOffRepair.findUnique({
                where: {
                    instrumentId: instrumentId, // Поиск по instrumentId
                },
            });

            let summary;

            if (existingSummary) {
                // Если запись существует, обновляем ее
                summary = await prisma.instrumentSummaryWriteOffRepair.update({
                    where: {
                        instrumentId: instrumentId, // Обновляем по instrumentId
                    },
                    data: {
                        totalWrittenOff: type === 'write_off' ? { increment: quantity } : undefined,
                    },
                });
            } else {
                // Если запись не существует, создаем ее
                // Для типа 'repairOff' нельзя создать запись, так как totalRemont не может быть отрицательным

                summary = await prisma.instrumentSummaryWriteOffRepair.create({
                    data: {
                        instrumentId,
                        totalWrittenOff: type === 'write_off' ? quantity : 0,
                    },
                });
            }
            return { summary }
        }

    }

    async createInstrumentTransaction(data) {
        // ТИпы операций
        // issue - выдача инструмента
        // return - возврат на баланс
        // returnedInWrittenOff - возврат на списание
        // sendWriteOff - Отправить на списание
        // write_off - списание со склада
        // repair - списание инструмента который подготовлен к списанию

        const {
            instrumentId,
            type,
            quantity,
            issuedTo,
            sectionId,
            machineId,
            userId,
            transactionType,
            storageCells,
            status, // Новый параметр: статус инструмента
        } = data;

        try {

            // Создаем запись о движении инструмента
            const transaction = await prisma.instrumentTransaction.create({
                data: {
                    instrumentId,
                    type,
                    quantity,
                    issuedTo,
                    sectionId,
                    machineId,
                    userId,
                    transactionType,
                    status: type === 'issue' ? status : null, // Передаем статус только при выдаче
                    createdAt: new Date(),
                },
            });

            // Обновляем агрегированные данные
            await this.updateSummary(instrumentId, type, quantity, machineId);

            // Обновляем количество инструментов в ячейках хранения и удаляем связь, если количество равно нулю
            for (const cell of storageCells) {
                const { id: storageCellId, quantity: cellQuantity } = cell;

                const toolCell = await prisma.toolCell.findUnique({
                    where: {
                        instrumentId_storageCellsId: {
                            instrumentId,
                            storageCellsId: storageCellId,
                        },
                    },
                });

                if (toolCell) {
                    const newQuantity = type === 'issue' || type === 'returnedInWrittenOff' || type === 'sendWriteOff' ? toolCell.quantity - cellQuantity : toolCell.quantity + cellQuantity;
                    await prisma.toolCell.update({
                        where: { id: toolCell.id },
                        data: { quantity: newQuantity },
                    });

                    // Если количество равно нулю, удаляем запись
                    if (newQuantity === 0) {
                        await prisma.toolCell.delete({
                            where: { id: toolCell.id },
                        });
                    }
                } else if (type === 'return') {
                    await prisma.toolCell.create({
                        data: {
                            instrumentId,
                            storageCellsId: storageCellId,
                            quantity: cellQuantity,
                        },
                    });
                }
            }

            if (type === 'issue' || type === 'sendWriteOff') {
                // Уменьшаем общее количество инструмента в таблице Instrument с помощью decrement
                await prisma.instrument.update({
                    where: { id: instrumentId },
                    data: {
                        quantity: {
                            decrement: quantity, // Уменьшаем quantity на указанное количество
                        },
                    },
                });
            } else if (type === 'return') {
                // Уменьшаем общее количество инструмента в таблице Instrument с помощью decrement
                await prisma.instrument.update({
                    where: { id: instrumentId },
                    data: {
                        quantity: {
                            increment: quantity, // Уменьшаем quantity на указанное количество
                        },
                    },
                });
            }



            return transaction;
        } catch (error) {
            console.error('Ошибка при создании транзакции:', error);
            throw new Error(error.message || 'Не удалось создать транзакцию');
        }
    }

    //   функия для списания

    async createInstrumentTransactionSpisanie(data) {
        // ТИпы операций
        // issue - выдача инструмента
        // return - возврат на баланс
        // returnedInWrittenOff - возврат на списание
        // sendWriteOff - Отправить на списание
        // write_off - списание со склада
        // repair - списание инструмента который подготовлен к списанию
        const {
            instrumentId,
            type = data.operationType,
            quantity = data.cells.reduce((sum, cell) => sum + cell.quantity, 0),
            userId,
            transactionType = data.operationType,
            reason,
            cells,
        } = data;

        try {
            // Проверка для операции возврата (если нужно)

            // Создаем запись о движении инструмента
            const transaction = await prisma.instrumentTransaction.create({
                data: {
                    instrumentId,
                    type,
                    quantity,
                    userId,
                    reason,
                    transactionType,
                    createdAt: new Date(),
                },
            });

            // Обновляем агрегированные данные
            await this.updateSummary(instrumentId, type, quantity);

            if (type === 'write_off') {

                for (const cell of cells) {
                    const { cellId: storageCellId, quantity: cellQuantity } = cell;

                    const toolCell = await prisma.toolCell.findUnique({
                        where: {
                            instrumentId_storageCellsId: {
                                instrumentId,
                                storageCellsId: storageCellId,
                            },
                        },
                    });

                    if (toolCell) {
                        const newQuantity = toolCell.quantity - cellQuantity;
                        await prisma.toolCell.update({
                            where: { id: toolCell.id },
                            data: { quantity: newQuantity },
                        });

                        // Если количество равно нулю, удаляем запись
                        if (newQuantity === 0) {
                            await prisma.toolCell.delete({
                                where: { id: toolCell.id },
                            });
                        }
                    }
                }

                // Уменьшаем общее количество инструмента в таблице Instrument с помощью decrement
                await prisma.instrument.update({
                    where: { id: instrumentId },
                    data: {
                        quantity: {
                            decrement: quantity, // Уменьшаем quantity на указанное количество
                        },
                    },
                });
            }



            return transaction;
        } catch (error) {
            console.error('Ошибка при создании транзакции:', error);
            throw new Error(error.message || 'Не удалось создать транзакцию');
        }
    }


    //   функия для возврата из ремонта

    async createInstrumentTransactionRemontOF(data) {
        const {
            instrumentId,
            type = data.operationType,
            quantity = data.cells.reduce((sum, cell) => sum + cell.quantity, 0),
            userId,
            transactionType = data.operationType,
            reason = 'Поступление инструмента который есть на балансе',
            cells,
        } = data;

        try {
            // Проверка для операции возврата (если нужно)

            // Создаем запись о движении инструмента
            const transaction = await prisma.instrumentTransaction.create({
                data: {
                    instrumentId,
                    type,
                    quantity,
                    userId,
                    reason,
                    transactionType,
                    createdAt: new Date(),
                },
            });

            // Обновляем агрегированные данные
            // await this.updateSummaryWriteOffRepair(instrumentId, type, quantity);

            // Обновляем количество инструментов в ячейках хранения и удаляем связь, если количество равно нулю
            for (const cell of cells) {
                const { cellId: storageCellId, quantity: cellQuantity } = cell;

                const toolCell = await prisma.toolCell.findUnique({
                    where: {
                        instrumentId_storageCellsId: {
                            instrumentId,
                            storageCellsId: storageCellId,
                        },
                    },
                });

                if (toolCell) {
                    const newQuantity = toolCell.quantity + cellQuantity;
                    await prisma.toolCell.update({
                        where: { id: toolCell.id },
                        data: { quantity: newQuantity },
                    });

                    // Если количество равно нулю, удаляем запись
                    if (newQuantity === 0) {
                        await prisma.toolCell.delete({
                            where: { id: toolCell.id },
                        });
                    }
                }
            }

            // Уменьшаем общее количество инструмента в таблице Instrument с помощью decrement
            await prisma.instrument.update({
                where: { id: instrumentId },
                data: {
                    quantity: {
                        increment: quantity, // Уменьшаем quantity на указанное количество
                    },
                },
            });

            return transaction;
        } catch (error) {
            console.error('Ошибка при создании транзакции:', error);
            throw new Error(error.message || 'Не удалось создать транзакцию');
        }
    }


    async createAdminInstrumentUser(data: any) {
        try {
            // console.log('Данные для создания инструмента:', {
            //     name: data.name,
            //     type: data.type,
            //     userId: data.userId,
            //     quantity: data.quantity,
            //     storageCellsData: data.storageCellsData,
            //     machineIds: data.machineIds,
            //     file: data.file,
            // });

            // Проверка наличия необходимых полей
            if (!data.name || !data.storageCellsData || !data.machineIds) {
                throw new Error('Некорректные данные для создания инструмента');
            }

            // Вычисление общего количества инструментов
            const totalQuantity = data.storageCellsData.reduce((sum, cell) => {
                return sum + cell.quantity;
            }, 0);

            // Создание инструмента
            const newInstrument = await prisma.instrument.create({
                data: {
                    name: data.name,
                    quantity: totalQuantity, // Установка общего количества
                    machines: {
                        create: data.machineIds.map((machineId: number) => ({
                            machine: { connect: { id: machineId } },
                        })),
                    },
                    toolCell: {
                        create: data.storageCellsData.map((cell: { storageCellId: number; quantity: number }) => ({
                            storageCells: { connect: { id: cell.storageCellId } },
                            quantity: cell.quantity,
                        })),
                    },
                    drawing: data.file ? {
                        create: {
                            name: data.file.name,
                            filePath: data.file.filePath,
                        },
                    } : undefined,
                },
                include: {
                    toolCell: {
                        include: {
                            storageCells: true,
                        },
                    },
                    machines: {
                        include: {
                            machine: true,
                        },
                    },
                    drawing: true,
                },
            });

            // Получаем ID созданного инструмента
            const instrumentId = newInstrument.id;
            console.log(instrumentId);


            // Создание записи в таблице InstrumentTransaction
            await prisma.instrumentTransaction.create({
                data: {
                    instrumentId: instrumentId, // Ссылка на созданный инструмент
                    type: "receipt", // Тип операции: приход
                    transactionType: 'receipt',
                    quantity: data.quantity, // Общее количество инструментов
                    status: "new", // Статус инструмента: новый
                    userId: data.userId, // Ссылка на пользователя, который выполнил операцию
                    createdAt: new Date(), // Дата и время операции
                },
            });

            return newInstrument;
        } catch (error) {
            console.error('Ошибка при добавлении инструмента:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // Получение списка выданных и возвращенных инструментов ===========================
    async getSummary() {
        try {
            const requestData = await prisma.instrumentSummary.findMany();

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка станков:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Получение списка списанных и поломанных инструментов ===========================
    async getSummaryRemont() {
        try {
            const requestData = await prisma.instrumentSummaryWriteOffRepair.findMany();

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка станков:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    // Получение спика готовыхх к списанию
    async getquarantinCell() {
        try {
            const requestData = await prisma.instrumentSummaryWriteOffRepair.findMany();
            // console.log(JSON.stringify(requestData, null, 2));

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка ролей:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
    // Получение спика для главной страницы
    async getAllSpisanieIsse() {
        try {
            const requestData = await prisma.instrumentSummaryWriteOffRepair.findMany();
            // console.log(JSON.stringify(requestData, null, 2));

            return requestData;
        } catch (error) {
            console.error('Ошибка при получении списка ролей:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }




}






//  // Функция для расчета сколько отдали и сколько вернули
//  async  updateSummary(
//     instrumentId: number,
//     sectionId: number | null,
//     machineId: number | null,
//     type: 'issue' | 'return' | 'write_off', // Добавлен тип 'write_off'
//     quantity: number
// ) {
//     // Используем upsert для обновления или создания записи
//     const summary = await prisma.instrumentSummary.upsert({
//         where: {
//             instrumentId_sectionId_machineId: {
//                 instrumentId,
//                 sectionId: sectionId || null,
//                 machineId: machineId || null,
//             },
//         },
//         update: {
//             totalIssued: type === 'issue' ? { increment: quantity } : undefined,
//             totalReturned: type === 'return' ? { increment: quantity } : undefined,
//             totalWrittenOff: type === 'write_off' ? { increment: quantity } : undefined, // Добавлено для списания
//         },
//         create: {
//             instrumentId,
//             sectionId: sectionId || null,
//             machineId: machineId || null,
//             totalIssued: type === 'issue' ? quantity : 0,
//             totalReturned: type === 'return' ? quantity : 0,
//             totalWrittenOff: type === 'write_off' ? quantity : 0, // Добавлено для списания
//         },
//     });

//     return summary;
// }