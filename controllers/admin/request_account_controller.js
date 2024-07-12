'use strict';

const md5 = require('md5');
const nodemailer = require("nodemailer");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const email_style = require('../../lib/email_style');

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const msg = {
        from: '"Lestari" <main@lestari.com>',
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(msg);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

exports.webrequestaccounts = async (req, res) => {
    try {
        let { page, search, approve, date_start, date_end } = req.query
        approve = approve && parseInt(approve)
        if (search === undefined || search === '') { search = '' }
        page = parseInt(page)
        if (page === undefined || isNaN(page)) { page = 1 }
        const where = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { instances: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (date_start && date_end) {
            where.date = {
                gte: new Date(date_start),
                lte: new Date(date_end)
            };
        } else if (date_start) {
            where.date = {
                gte: new Date(date_start)
            };
        } else if (date_end) {
            where.date = {
                lte: new Date(date_end)
            };
        }

        if (approve !== undefined && approve !== null && approve !== '') {
            where.approve = approve
        }
        const requestAccounts = await prisma.request_Accounts.findMany({
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                id_request_account: 'desc'
            },
            where,
        });
        const count = await prisma.request_Accounts.count({ where });

        const pagination = {
            page,
            total_page: Math.ceil(count / 10),
            total_data: count,
        }

        return res.status(200).json({ status: 200, pagination, values: requestAccounts });
    } catch (error) {
        console.error('Error fetching request accounts:', error);
        return res.status(500).json({ status: 500, message: 'Failed to fetch request accounts' });
    }
};

exports.webrequestaccountid = async (req, res) => {
    let id = parseInt(req.params.id);
    try {
        const requestAccount = await prisma.request_Accounts.findUnique({
            where: { id_request_account: id }
        });

        if (!requestAccount) {
            return res.status(404).json({ status: 404, message: 'Request account not found' });
        }

        return res.status(200).json({ status: 200, values: [requestAccount] });
    } catch (error) {
        console.error(`Error fetching request account with id ${id}:`, error);
        return res.status(500).json({ status: 500, message: 'Failed to fetch request account' });
    }
};

exports.webapproverequestaccount = async (req, res) => {
    const { approve } = req.body;
    const id = parseInt(req.params.id); // Pastikan id diparsing sebagai integer

    try {
        const formattedDateTime = new Date().toLocaleString('en-ID', { timeZone: 'Asia/Jakarta' });

        // Ambil data request account berdasarkan id
        const requestAccount = await prisma.request_Accounts.findUnique({
            where: { id_request_account: id }
        });

        if (!requestAccount) {
            return res.status(404).json({ status: 404, message: 'Request account not found' });
        }

        // Email dari request account
        const email = requestAccount.email;

        // Update status approve berdasarkan nilai approve yang diterima
        let updatedRequestAccount;
        if (approve === 1) {
            updatedRequestAccount = await prisma.request_Accounts.update({
                where: { id_request_account: id },
                data: { approve: 1 }
            });
            const htmlContent = `
                                                                                          <!DOCTYPE html>
                                                                                <html lang="en">
                                                                                <head>
                                                                                    <meta charset="UTF-8">
                                                                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                                                    <title>Informasi Pengiriman Data Konservasi Satwa dari Lestari</title>
                                                                                  ${email_style.email_style()}
                                                                                </head>
                                                                                <body>
                                                                                    <div class="container">
                                                                                        <h1>Informasi Pembuatan Akun Konservasi Satwa dari Instansi Lestari</h1>
                                                                                        <p>Salam sejahtera,</p>
                                                                                        <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa pembuatan akun untuk konservasi satwa yang Anda minta tidak dapat kami kirimkan karena suatu hal.</p>                                                                           
                                                                                        <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                                                                                        <p>Salam hormat,</p>
                                                                                        <p>Tim Lestari</p>
                                                                                        <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a>  </p>  
                                                                                    </div>
                                                                                </body>
                                                                                </html>

        `
            await sendEmail(email, "Informasi Pembuatan Akun Konservasi Satwa dari Lestari", htmlContent);

        } else if (approve === 2) {
            updatedRequestAccount = await prisma.request_Accounts.update({
                where: { id_request_account: id },
                data: { approve: 2 }
            });

            // Jika approve adalah 2, buat user baru
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let randomPassword = '';

            for (let i = 0; i < 9; i++) {
                randomPassword += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            const newUser = await prisma.users.create({
                data: {
                    email: requestAccount.email,
                    name: requestAccount.name,
                    phone: requestAccount.phone,
                    password: md5(randomPassword),
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: 1
                }
            });

            if (newUser) {

                const htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Informasi Pembuatan Akun Konservasi Satwa dari Lestari</title>
                        ${email_style.email_style()}
                        </head>
                        <body>
                            <div class="container">
                                <h1>Informasi Pembuatan Akun Konservasi Satwa dari Instansi Lestari</h1>
                                <p>Salam sejahtera,</p>
                                <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa data konservasi satwa yang Anda minta telah berhasil kami kirimkan. Berikut adalah detail pengiriman:</p>
                                <ul>
                                    <li><strong>Tanggal Pengiriman:</strong> ${formattedDateTime}</li>
                                    <li><strong>Jenis Data:</strong> Akun User</li>
                                    <li><strong>Metode Pengiriman:</strong> Email</li>
                                    <li><strong>Email:</strong> ${email}</li>
                                    <li><strong>Password:</strong> ${randomPassword}</li>
                                </ul>
                                <p><strong>Perhatian:</strong> Password harap segera diganti untuk keamanan akun Anda.</p>
                                <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                                <p>Salam hormat,</p>
                                <p>Tim Lestari</p>
                                <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>
                            </div>
                        </body>
                        </html>
                    `
                await sendEmail(email, "Informasi Pembuatan Akun Konservasi Satwa dari Lestari", htmlContent);
            }
        }

        return res.status(200).json({ status: 200, message: 'Request account approved successfully', data: updatedRequestAccount });
    } catch (error) {
        console.error(`Error approving request account with id ${id}:`, error);
        return res.status(500).json({ status: 500, message: 'Failed to approve request account' });
    }
};