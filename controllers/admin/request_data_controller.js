'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authorize } = require('../../lib/authorize')
const { uploadFileToDrive } = require('../../lib/uploadFileToDrive')
const { datetimenow, formattedDate, formattedDateTime } = require('../../lib/date');


const { email_style } = require('../../lib/email_style');
const { sendEmail } = require('../../lib/sendEmail');


exports.webrequestdatas = async (req, res) => {
    try {
        let { page, search, date_start, date_end } = req.query
        if (search === undefined || search === '') { search = '' }
        page = parseInt(page)
        if (page === undefined || isNaN(page)) { page = 1 }

        const where = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { profession: { contains: search, mode: 'insensitive' } },
                { instances: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
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

        const requestDatas = await prisma.request_Datas.findMany({
            skip: (page - 1) * 10,
            take: 10,
            orderBy: {
                id_request_data: 'desc'
            },
            where
        });

        const count = await prisma.request_Datas.count({ where });
        const pagination = {
            page,
            total_page: Math.ceil(count / 10),
            total_data: count,
        }
        return res.status(200).json({ status: 200, pagination, values: requestDatas });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

exports.webrequestdataid = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const requestData = await prisma.request_Datas.findUnique({
            where: { id_request_data: id }
        });

        if (!requestData) {
            return res.status(404).json({ status: 404, message: 'Request data not found' });
        }

        return res.status(200).json({ status: 200, values: [requestData] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};


exports.webapproverequestdata = async (req, res) => {
    const approve = req.body.approve;
    const id = parseInt(req.params.id);

    try {
        if (approve === 1) {
            await prisma.request_Datas.update({
                where: { id_request_data: id },
                data: { approve: 1 }
            });

            const requestData = await prisma.request_Datas.findUnique({
                where: { id_request_data: id }
            });

            const email = requestData.email;
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Informasi Pengiriman Data Konservasi Satwa dari Lestari</title>
                                                                                                      ${email_style}

                </head>
                <body>
                    <div class="container">
                        <h1>Informasi Pengiriman Data Konservasi Satwa dari Instansi Lestari</h1>
                        <p>Salam sejahtera,</p>
                        <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa data konservasi satwa yang Anda minta tidak dapat kami kirimkan karena suatu hal.</p>                                                                           
                        <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                        <p>Salam hormat,</p>
                        <p>Tim Lestari</p>
                        <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>  
                    </div>
                </body>
                </html>
            `;

            await sendEmail(email, "Data Datwa Liar", htmlContent);
            return res.status(200).json({ status: 200, message: "Request rejected" });
        } else if (approve === 2) {
            await prisma.request_Datas.update({
                where: { id_request_data: id },
                data: { approve: 2 }
            });
            return res.status(200).json({ status: 200, message: "Request approved" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};




exports.websendrequestdata = async (req, res) => {
    const {
        local_name, latin_name, habitat, description, city, longitude,
        latitude, image, amount, date_start, date_end, id_request_data
    } = req.body;

    try {
        if(!id_request_data){
            return res.status(400).json({ status: 400, message: "ID request data is required." });
        }
        
        const validateRequestData = await prisma.request_Datas.findFirst({
            where: { id_request_data: parseInt(id_request_data) },
            select: { approve: true }
        });

        if (!validateRequestData) {
            return res.status(404).json({ status: 404, message: "No data found for the specified ID." });
        } else if (validateRequestData && validateRequestData.approve !== 2) {
            return res.status(400).json({ status: 400, message: "Not allowed to send data." });
        }

        const sendData = await prisma.send_Datas.create({
            data: {
                local_name: parseInt(local_name),
                latin_name: parseInt(latin_name),
                habitat: parseInt(habitat),
                description: parseInt(description),
                city: parseInt(city),
                longitude: parseInt(longitude),
                latitude: parseInt(latitude),
                image: parseInt(image),
                amount: parseInt(amount),
                date_start,
                date_end
            }
        });

        // example ISO-8601 DateTime: 2023-09-21T15:45:30.000Z
        const id_send_data = sendData.id_send_data;

        const requestData = await prisma.request_Datas.findUnique({
            where: { id_request_data: parseInt(id_request_data) }
        });

        if (!requestData) {
            return res.status(404).json({ status: 404, message: "No data found for the specified ID." });
        }

        const { name, email, profession, instances, subject, body, id_user } = requestData;
        const now = new Date();


        await prisma.history_Request_Datas.create({
            data: {
                email, name, profession, instances, subject, body,
                id_user, id_send_data, date: datetimenow
            }
        });

        const select = {};

        const selectedFields = [];
        if (local_name) selectedFields.push("local_name");
        if (latin_name) selectedFields.push("latin_name");
        if (habitat) selectedFields.push("habitat");
        if (description) selectedFields.push("description");
        if (city) selectedFields.push("city");
        if (longitude) selectedFields.push("longitude");
        if (latitude) selectedFields.push("latitude");
        if (image) selectedFields.push("image");
        if (amount) selectedFields.push("amount");

        if (local_name) { select.local_name = true }
        if (latin_name) { select.latin_name = true }
        if (habitat) { select.habitat = true }
        if (description) { select.description = true }
        if (city) { select.city = true }
        if (longitude) { select.longitude = true }
        if (latitude) { select.latitude = true }
        if (image) { select.image = true }
        if (amount) { select.amount = true }        

        const animalsData = await prisma.animals.findMany({
            where: {
                date: {
                    gte: new Date(date_start),
                    lte: new Date(date_end),
                }
            },
            select
        });

        if (animalsData.length === 0) {
            return res.status(400).json({ status: 400, message: "There's no data in range" });
        }

        const result = animalsData.map(row => {
            const obj = {};
            if (row.local_name) obj.local_name = row.local_name;
            if (row.latin_name) obj.latin_name = row.latin_name;
            if (row.habitat) obj.habitat = row.habitat;
            if (row.description) obj.description = row.description;
            if (row.city) obj.city = row.city;
            if (row.longitude) obj.longitude = row.longitude;
            if (row.latitude) obj.latitude = row.latitude;
            if (row.amount) obj.amount = row.amount;
            if (image && row.image !== undefined && row.image !== null) {
                obj.image = row.image;
            }            
            return obj;
        }).filter(obj => Object.keys(obj).length > 0);

        let csv = selectedFields.join(',') + '\n';
        result.forEach(row => {
            csv += Object.values(row).map(value => (
                typeof value === 'string' && value.includes(',') ? `"${value}"` : value
            )).join(',') + '\n';
        });

        const fileName = `${id_send_data}_${name}_${now.toISOString().split('T')[0].replace(/-/g, '')}.csv`;

        const authClient = await authorize();
        const fileData = await uploadFileToDrive(authClient, fileName, Buffer.from(csv), "data");
        const fileURL = fileData.webViewLink;

        await prisma.request_Datas.update({
            where: { id_request_data: parseInt(id_request_data) },
            data: { url: fileURL }
        });

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Informasi Pengiriman Data Konservasi Satwa dari Lestari</title>
                ${email_style()}
            </head>
            <body>
                <div class="container">
                    <h1>Informasi Pengiriman Data Konservasi Satwa dari Instansi Lestari</h1>
                    <p>Salam sejahtera,</p>
                    <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa data konservasi satwa yang Anda minta telah berhasil kami kirimkan. Berikut adalah detail pengiriman:</p>
                    <ul>
                        <li><strong>Tanggal Pengiriman:</strong> ${formattedDateTime}</li>
                        <li><strong>Jenis Data:</strong> Data Konservasi Satwa</li>
                        <li><strong>Metode Pengiriman:</strong> Email</li>
                        <li><strong>Nama Penerima:</strong> ${name}</li>
                        <li><strong>Alamat Email Penerima:</strong> ${email}</li>                                            
                    </ul>
                    <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini atau melalui email.</p>
                    <p>Salam hormat,</p>
                    <p>Tim Lestari</p>
                    <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>
                    <a href="${fileURL}" class="button">Unduh Data</a>
                </div>
            </body>
            </html>
        `;

        await sendEmail(email, "Data Satwa Liar", htmlContent);

        return res.status(200).json({ status: 200, message: "Request data sent successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: "Failed to send request data" });
    }
};
