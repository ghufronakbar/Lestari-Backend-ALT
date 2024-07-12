'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.webusers = async (req, res) => {

    const { hostname } = req;
    const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
    const baseUrl = `http://${hostname}${port}`;

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
            picture: user.picture ? `${baseUrl}/v1/mob/image/profile/${user.picture}` : `${baseUrl}/v1/mob/image/profile/default.png`,
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
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.webuserid = async (req, res) => {
    const id = parseInt(req.params.id);

    const { hostname } = req;
    const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
    const baseUrl = `http://${hostname}${port}`;

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
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const result = {
            id_user: user.id_user,
            name: user.name,
            email: user.email,
            picture: user.picture ? `${baseUrl}/v1/mob/image/profile/${user.picture}` : `${baseUrl}/v1/mob/image/profile/default.png`,
            phone: user.phone,
            created_at: user.created_at,
            updated_at: user.updated_at,
            status: user.status
        };

        return res.status(200).json({ status: 200, values: [result] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.webusersuspend = async (req, res) => {
    const { status, id } = req.body;

    try {
        await prisma.users.update({
            where: { id_user: parseInt(id) },
            data: { status }
        });

        const message = status === 1 ? 'Suspend successfully' : 'Unsuspend successfully';
        return res.status(200).json({ status: 200, message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};
