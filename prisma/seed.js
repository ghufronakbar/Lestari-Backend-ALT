const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const md5 = require('md5');


const createAdminIfNotExist = async () => {
    try {
        const validateAdmin = await prisma.admins.findMany();

        if (validateAdmin.length === 0) {
            await prisma.admins.create({
                data: {
                    email: 'admin@example.com',
                    password: md5('admin#1234'),
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

createAdminIfNotExist().then(() => {
    prisma.$disconnect();
}).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})