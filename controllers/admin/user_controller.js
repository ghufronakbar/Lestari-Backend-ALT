'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.webusers = async (req, res) => {

    try {
        let { page, search, status } = req.query
        status = status && parseInt(status)
        if (search === undefined || search === '') { search = '' }
        page = parseInt(page)
        if (page === undefined || isNaN(page)) { page = 1 }

        const where = {
            NOT: {
                id_user: 0
            },
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status !== undefined && status !== '') {
            where.status = status
        }

        const users = await prisma.users.findMany({
            skip: (page - 1) * 10,
            take: 10,
            select: {
                id_user: true,
                email: true,
                name: true,
                phone: true,
                picture: true,
                created_at: true,
                updated_at: true,
                status: true
            }, where,
            orderBy: {
                id_user: 'desc'
            }
        });

        const results = users.map(user => ({
            id_user: user.id_user,
            name: user.name,
            email: user.email,
            picture: user.picture,
            phone: user.phone,
            created_at: user.created_at,
            updated_at: user.updated_at,
            status: user.status
        }));

        const count = await prisma.users.count({ where });

        const pagination = {
            page,
            total_page: Math.ceil(count / 10),
            total_data: count,
        }

        return res.status(200).json({ status: 200, pagination, values: results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};

exports.webuserid = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const user = await prisma.users.findUnique({
            where: { id_user: id },
            select: {
                id_user: true,
                email: true,
                name: true,
                phone: true,
                picture: true,
                created_at: true,
                updated_at: true,
                status: true
            }
        });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'Data tidak ditemukan' });
        }

        const result = {
            id_user: user.id_user,
            name: user.name,
            email: user.email,
            picture: user.picture ,
            phone: user.phone,
            created_at: user.created_at,
            updated_at: user.updated_at,
            status: user.status
        };

        return res.status(200).json({ status: 200, values: [result] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};

exports.webusersuspend = async (req, res) => {
    const { status, id } = req.body;

    try {
        await prisma.users.update({
            where: { id_user: parseInt(id) },
            data: { status }
        });

        const message = status === 1 ? 'Berhasil mengaktifkan akun' : 'Berhasil menonaktifkan akun';
        return res.status(200).json({ status: 200, message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Terjadi kesalahan sistem' });
    }
};
