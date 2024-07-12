'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const ip = require('ip');
const { email_style } = require('../../lib/email_style');
const { sendEmail } = require('../../lib/sendEmail');
const { randomPassword } = require('../../lib/randomPassword');
const password = randomPassword();
const date = new Date();
const expired_at = new Date(date.getTime() + 12 * 60 * 60 * 1000)
const { formattedDateTime } = require('../../lib/date')


exports.login = async (req, res) => {
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
        const token = jwt.sign({ id_admin: admin.id_admin, super_admin: admin.super_admin }, process.env.JWT_SECRET, {
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
        console.log("Error during login:", error);
        res.status(500).json({
            Error: true,
            Message: "Internal server error"
        });
    }
};


exports.create_admin = async (req, res) => {
    const { name, email } = req.body;

    const { hostname } = req;
    const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
    const baseUrl = `http://${hostname}${port}`;

    try {
        if (!email || !name) { return res.status(400).json({ status: 400, message: "Email and name required" }) }

        const checkEmail = await prisma.admins.findFirst({
            where: {
                email: email
            }
        });

        if (checkEmail) { return res.status(400).json({ status: 400, message: "Email already exists" }) }

        const token = jwt.sign({ email, name }, process.env.JWT_SECRET, {
            expiresIn: '12h'
        });
        const verifyEmail = await prisma.verify.create({
            data: {
                email,
                token,
                expired_at,
                used: 0,
                type: "CREATE"
            }
        });

        const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verifikasi Admin Lestari</title>
                    ${email_style()}
                </head>                
                <body>                
                    <div class="container">
                        <h1>Verfikasi Pembuatan Akun Admin Lestari</h1>
                        <p>Salam sejahtera,</p>
                        <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa akun admin Lestari Anda telah dibuat.</p>                                                                           
                        <p>Silahkan klik tombol di bawah ini untuk melakukan verifikasi akun Anda.</p>    
                        <ul>
                            <li><strong>Alamat Email Penerima:</strong> ${email}</li>                                            
                            <li><strong>Created At:</strong> ${formattedDateTime}</li>
                            <li><strong>Expired In:</strong> 12 hours</li>                                                       
                        </ul>                                 
                        <a href="${baseUrl}/v1/web/verify-account/${token}" class="button">Verifikasi</a>
                        <h3>Atau anda dapat klik link di bawah ini</h3>                                      
                        <a href="${baseUrl}/v1/web/verify-account/${token}">${baseUrl}/v1/web/verify-account/${token}</a>
                        <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                        <p>Salam hormat,</p>
                        <p>Tim Lestari</p>
                        <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>  
                    </div>
                </body>
                </html>
            `;

        await sendEmail(email, "Verifikasi Akun", htmlContent);


        return res.status(200).json({ status: 200, email, message: "Verification Email Sent to " + email, token });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ Message: "Internal server error" });
    }
}

exports.verify_account = async (req, res) => {
    const { token } = req.params;

    try {
        if (!token) { return res.status(400).json({ status: 400, message: "Token required" }) }

        const checkToken = await prisma.verify.findFirst({
            where: {
                token: token
            }
        });

        if (!checkToken) { return res.status(400).send("Invalid key") }

        if (checkToken.used === 1) { return res.status(400).send("Key already used") }

        if (checkToken.expired_at < new Date()) { return res.status(400).send("Key expired") }

        await prisma.verify.update({
            where: {
                id_verify: checkToken.id_verify
            },
            data: {
                used: 1
            }
        });

        if (checkToken.type === "CREATE") {
            const createAdmin = await prisma.admins.create({
                data: {
                    email: checkToken.email,
                    password: md5(password)
                }
            });
        } else if (checkToken.type === "RESET") {
            await prisma.admins.update({
                where: {
                    email: checkToken.email
                },
                data: {
                    password: md5(password)
                }
            });
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Akun Terverifikasi</title>
            ${email_style()}
        </head>
        <body>
            <div class="container">
                <h1>Email Terverifikasi Sebagai Akun Admin</h1>
                <p>Salam sejahtera,</p>
                <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa akun admin Lestari Anda telah berhasil diverifikasi.</p>                                                                           
                <p>Silahkan login menggunakan akun berikut.</p>    
                <ul>
                    <li><strong>Email:</strong> ${checkToken.email}</li>                                            
                    <li><strong>Password:</strong> ${password}</li>
                </ul>                                 
                <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                <p>Salam hormat,</p>
                <p>Tim Lestari</p>
                <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>  
            </div>
        </body>
        </html>
    `;


        await sendEmail(checkToken.email, "Akun Terverifikasi", htmlContent);

        return res.status(200).redirect(301, `${process.env.CLIENT_URL}/admin/login`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ Message: "Internal server error" });
    }
}

exports.reset_password = async (req, res) => {
    const { email } = req.body;

    const { hostname } = req;
    const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
    const baseUrl = `http://${hostname}${port}`;

    try {
        if (!email || email === "") { return res.status(400).json({ status: 400, message: "Email required" }) }

        const checkEmail = await prisma.admins.findFirst({
            where: {
                email
            }
        });

        if (!checkEmail) { return res.status(400).json({ status: 400, message: `Email ${email} not found` }) }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "12h" });

        const verifyEmail = await prisma.verify.create({
            data: {
                email,
                token,
                expired_at,
                used: 0,
                type: "RESET"
            }
        });

        const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                    ${email_style()}
                </head>                
                <body>                
                    <div class="container">
                        <h1>Reset Password Admin Lestari</h1>
                        <p>Salam sejahtera,</p>
                        <p>Kami dari Instansi Lestari ingin memberitahu Anda untuk mengatur ulang kata sandi.</p>                                                                           
                        <p>Silahkan klik tombol di bawah ini untuk melakukan verifikasi akun Anda.</p>    
                        <ul>
                            <li><strong>Alamat Email Penerima:</strong> ${email}</li>                                            
                            <li><strong>Created At:</strong> ${formattedDateTime}</li>
                            <li><strong>Expired In:</strong> 12 hours</li>                                                       
                        </ul>                                 
                        <a href="${baseUrl}/v1/web/verify-account/${token}" class="button">Verifikasi</a>                                      
                        <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                        <p>Salam hormat,</p>
                        <p>Tim Lestari</p>
                        <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>  
                    </div>
                </body>
                </html>
            `;

        await sendEmail(email, "Reset Password", htmlContent);

        return res.status(200).json({ status: 200, message: "Email sent to " + email });



    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });

    }

}

exports.delete_admin = async (req, res) => {
    const id_admin = parseInt(req.params.id_admin);

    try {
        const checkSuperAdmin = await prisma.admins.findFirst({
            where: {
                id_admin,
                super_admin: 1
            }
        });

        if (checkSuperAdmin) {
            return res.status(400).json({ status: 400, message: "Super Admin cannot be deleted" });
        }

        await prisma.admins.delete({
            where: {
                id_admin
            }
        });
        return res.status(200).json({ status: 200, message: "Admin deleted" });
    }
    catch {
        console.log(error);
        return res.status(500).json({ status: 500, message: "Internal server error" });
    }
}


exports.show_admin = async (req, res) => {
    try {
        let { page, search, date_start, date_end } = req.query
        if (search === undefined || search === '') { search = '' }
        page = parseInt(page)
        if (page === undefined || isNaN(page)) { page = 1 }

        const where = {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ]
        }
        if (date_start && date_end) {
            where.created_at = {
                gte: new Date(date_start),
                lte: new Date(date_end)
            };
        } else if (date_start) {
            where.created_at = {
                gte: new Date(date_start)
            };
        } else if (date_end) {
            where.created_at = {
                lte: new Date(date_end)
            };
        }

        const admins = await prisma.admins.findMany({
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                id_admin: 'desc'
            },
            where,
            select: {
                id_admin: true,
                email: true,
                name: true,
                super_admin: true,
                created_at: true
            }
        });

        const count = await prisma.admins.count({ where });

        const pagination = {
            page,
            total_page: Math.ceil(count / 10),
            total_data: count,
        }

        return res.status(200).json({ status: 200, pagination, values: admins });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}


exports.update_admin = async (req, res) => {
    const id_admin = parseInt(req.decoded.id_admin);
    const { name, password, confirmation_password } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ status: 400, message: 'Name is required' });
        }
        if ((!password && !confirmation_password) || (password == "" && confirmation_password == "")) {
            const updateProfile = await prisma.admins.update({
                where: {
                    id_admin
                },
                data: {
                    name,
                }
            });
            return res.status(200).json({ status: 200, message: 'Profile updated' });
        } else if (password && confirmation_password) {
            if (password !== confirmation_password) {
                return res.status(400).json({ status: 400, message: 'Password and confirmation password do not match' });
            } else if (password.length < 8) {
                return res.status(400).json({ status: 400, message: 'Password must be at least 8 characters' });
            }
            const updateProfile = await prisma.admins.update({
                where: {
                    id_admin
                },
                data: {
                    name,
                    password: md5(password)
                }
            });
            return res.status(200).json({ status: 200, message: 'Profile and Password updated' });
        }
    }
    catch {
        console.log(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}

exports.admin_profile = async (req, res) => {
    const id_admin = parseInt(req.decoded.id_admin);
    try {
        const admin = await prisma.admins.findUnique({
            where: {
                id_admin
            }
        });
        return res.status(200).json({ status: 200, values: admin });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
}