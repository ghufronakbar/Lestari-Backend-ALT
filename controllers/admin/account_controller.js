'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const ip = require('ip');

exports.login = async function (req, res) {
    const { email, password } = req.body;   

    try {
        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "Email dan Password wajib diisi!"
            })
        }
        // Cari admin berdasarkan email dan password yang di-hash
        const admin = await prisma.admins.findFirst({
            where: {
                email: email,
                password: md5(password)
            }
        });

        if (!admin) {
            return res.status(400).json({
                Error: true,
                Message: "Email atau Password Salah!"
            });
        }

        // Generate JWT token
        const token = jwt.sign({ id_admin: admin.id_admin }, process.env.JWT_SECRET, {
            expiresIn: '12h' // Token berlaku selama 12 jam
        });

        // Hapus refresh token lama sebelum memperbarui dengan yang baru
        await prisma.admins.update({
            where: { id_admin: admin.id_admin },
            data: { refresh_token: "" }
        });

        // Update refresh token dan alamat IP baru
        const updatedAdmin = await prisma.admins.update({
            where: { id_admin: admin.id_admin },
            data: {
                refresh_token: token,
                ip_address: ip.address()
            }
        });

        res.json({
            success: true,
            message: "Token JWT Generated!",
            token: token
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            Error: true,
            Message: "Internal server error"
        });
    }
};
