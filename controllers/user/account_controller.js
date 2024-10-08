"use strict";

const multer = require("multer");
const md5 = require("md5");
const nodemailer = require("nodemailer");
const email_style = require('../../lib/email_style');
const { uploadFileToDrive } = require('../../lib/uploadFileToDrive');
const { deleteFileFromDrive } = require('../../lib/deleteFromDrive');
const { authorize } = require('../../lib/authorize');
const { extractFileIdFromUrl } = require('../../lib/extractFileIdFromUrl');


const { PrismaClient } = require('@prisma/client');
const { formattedDateTime } = require("../../lib/date");
const prisma = new PrismaClient();

exports.mobaccount = async (req, res) => {
  const id_user = req.decoded.id_user;

  const { hostname } = req;
  const port = req.port !== undefined ? `:${req.port}` : process.env.PORT !== undefined ? `:${process.env.PORT}` : '';
  const baseUrl = `http://${hostname}${port}`;

  try {
    const userData = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      },
      select: {
        id_user: true,
        email: true,
        name: true,
        phone: true,
        picture: true,
      },
    });

    if (!userData) {
      return res.status(404).json({ status: 404, message: "Data tidak ditemukan" });
    }

    const results = {
      id_user: userData.id_user,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      picture: userData.picture ? userData.picture : `${baseUrl}/v1/mob/image/profile/default.png`,
    };

    return res.status(200).json({ status: 200, values: results });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
};

exports.mobaccountpassword = async (req, res) => {
  const password = req.body.password;
  const id_user = req.decoded.id_user;

  try {
    const userData = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      },
      select: {
        password: true,
      },
    });

    if (!userData) {
      return res.status(404).json({ status: 404, message: "Data tidak ditemukan" });
    }

    const oldPassword = md5(password);

    if (oldPassword === userData.password) {
      return res.status(200).json({ match: true });
    } else {
      return res.status(200).json({ match: false });
    }
  } catch (error) {
    console.error("Error checking password:", error);
    return res.status(500).json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
};

exports.mobpasswordedit = async (req, res) => {
  const new_password = req.body.new_password;
  const id_user = req.decoded.id_user;

  try {
    const updatedUser = await prisma.users.update({
      where: {
        id_user: id_user,
      },
      data: {
        password: md5(new_password),
      },
    });

    return res.status(200).json({ status: 200, message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
};

exports.mobregisteruser = async (req, res) => {
  const {
    name,
    email,
    phone,
    profession,
    instances,
    kepentingan: subject,
    deskripsi: body
  } = req.body;

  try {        
    await prisma.request_Accounts.create({
      data: {
        name,
        email,
        phone,
        profession,
        instances,
        subject,
        body,        
        approve: 0,
      },
    });

    return res.status(200).json({ keterangan: "Berhasil menambah data" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Terjadi kesalahan sistem" });
  }
};

exports.mobaccounteditname = async (req, res) => {
  const { name } = req.body;
  const id_user = req.decoded.id_user;

  try {
    const now = new Date();
    const date_now = now.toISOString(); 

    await prisma.users.update({
      where: {
        id_user: id_user,
      },
      data: {
        name,
        updated_at: date_now,
      },
    });

    return res.status(200).json({ status: 200, keterangan: "Berhasil mengedit data" });
  } catch (error) {
    console.error("Error editing user data:", error);
    return res.status(500).json({ error: "Terjadi kesalahan sistem" });
  }
};

//GA KEPAKE
exports.mobaccounteditpicture = async (req, res) => {
  const { picture } = req.body;
  const id_user = req.decoded.id_user;

  try {
    const now = new Date();
    const date_now = now.toISOString(); 

    await prisma.users.update({
      where: {
        id_user: id_user,
      },
      data: {
        picture,
        updated_at: date_now,
      },
    });

    return res.status(200).json({ status: 200, message: "Foto profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ error: "Terjadi kesalahan sistem" });
  }
};


exports.mob_update_profile = async (req, res) => {
  const id_user = req.decoded.id_user;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      },
    });

    if (!user) {
      return res.status(404).send("Data tidak ditemukan");
    }

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB (dalam bytes)
      },
    }).single("image");

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.json({
          success: 0,
          message: err.message,
        });
      } else if (err) {
        return res.json({
          success: 0,
          message: "Terjadi kesalahan saat mengunggah gambar",
        });
      }

      const fileBuffer = req.file.buffer;
      const datetime = new Date().toISOString().replace(/[-T:\.Z]/g, "");
      const fileName = `${user.name}_${datetime}.jpg`;

      const authClient = await authorize();

      let deleteError = false;

      if (user.picture) {
        const fileId = extractFileIdFromUrl(user.picture);
        if (fileId) {
          try {
            await deleteFileFromDrive(authClient, fileId);
          } catch (deleteErr) {
            console.error('Error deleting previous profile picture:', deleteErr);
            deleteError = true;  // Track that delete encountered an error, but continue with upload
          }
        }
      }

      const uploadedFile = await uploadFileToDrive(authClient, fileName, fileBuffer, 'profile');

      await prisma.users.update({
        where: {
          id_user: id_user,
        },
        data: {
          picture: `https://drive.google.com/uc?export=view&id=${uploadedFile.id}`,
        },
      });

      res.status(200).json({
        status: 200,
        image_url: `https://drive.google.com/uc?export=view&id=${uploadedFile.id}`,
        image_id: uploadedFile.id,
        message: deleteError ? 
          "Profile berhasil diperbarui tetapi terdapat kesalahan saat menghapus gambar sebelumnya" : 
          "Profile berhasil diperbarui",
      });
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).send("Terjadi kesalahan sistem");
  }
};



exports.mobaccounteditpassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const id_user = req.decoded.id_user;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id_user: id_user,
      },
      select: {
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "Data tidak ditemukan" });
    }

    const verification_password = user.password;
    if (md5(old_password) === verification_password) {
      const now = new Date();
      const date_now = now.toISOString(); // Format ISO string untuk tanggal

      await prisma.users.update({
        where: {
          id_user: id_user,
        },
        data: {
          password: md5(new_password),
          updated_at: date_now,
        },
      });

      return res.status(200).json({ status: 200, message: "Password berhasil diperbarui" });
    } else {
      return res.status(400).json({ status: 400, message: "Password lama tidak sesuai" });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
};

exports.mobforgotpassword = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!otp && email) {
      const user = await prisma.users.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(400).send(`${email} tidak terdaftar`);
      }

      let otpcode = "";
      for (let i = 0; i < 6; i++) {
        otpcode += Math.floor(Math.random() * 10);
      }

      const currentTime = new Date();
      const expired_at = new Date(currentTime.getTime() + 5 * 60000);

      await prisma.otps.create({
        data: {
          email: email,
          otp: otpcode,
          expired_at: expired_at,
          used: 0,
        },
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp@gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const msg = {
        from: '"Lestari" <main@lestari.com>',
        to: `${email}`,
        subject: "Kode OTP Lestari",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Kode OTP Lestari</title>
              ${email_style.email_style()}
          </head>
          <body>
              <div class="container">
                  <h1>Verifikasi Akun</h1>
                  <p>Salam sejahtera,</p>
                  <p>Sebelum melakukan reset password pada akun Anda, silakan masukkan kode OTP berikut untuk menyelesaikan proses verifikasi.</p>
                  <span class="otp-code">${otpcode}</span> 
                  <p><strong>Perhatian:</strong> Kode OTP hanya berlaku selama 5 menit dan bersifat rahasia. Mohon untuk tidak membagikan kode ini kepada siapapun termasuk pihak yang mengatasnamakan pihak Lestari.</p>
                  <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini:</p>
                  <p>Salam hormat,</p>
                  <p>Tim Lestari</p>
                  <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>
              </div>
          </body>
          </html>
        `,
      };

      // Kirim email dengan kode OTP
      await transporter.sendMail(msg);

      return res.status(200).json({
        status: 200,
        message: `OTP dikirim ke ${email}`,
      });
    } else if (email && otp) {
      const user = await prisma.users.findFirst({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(400).send(`${email} tidak terdaftar`);
      }

      const otpData = await prisma.otps.findFirst({
        where: {
          AND:[
            {email},    
            {otp}        
          ]          
        },
        orderBy: {
          id_otp: "desc",
        },
      });      

      if (!otpData) {
        return res.status(400).json({status:400, message: "OTP tidak ditemukan!"});
      }

      const confirmation_used = otpData.used;
      const confirmation_otp = otpData.otp;
      const expired_at = new Date(otpData.expired_at);
      const currentTime = new Date();

      if (confirmation_used === 1) {
        return res.status(400).json({status:400, message: "OTP sudah digunakan!"});
      } else if (confirmation_otp !== otp) {
        return res.status(400).json({status:400, message: "OTP yang anda masukkan salah!"});
      } else if (currentTime > expired_at) {
        return res.status(400).json({status:400, message: "OTP sudah kadaluarsa!"});
      } else if (currentTime < expired_at) {
        await prisma.otps.updateMany({
          where: {
           AND:[
            {email},
            {otp}
           ]
          },
          data: {
            used: 1,
          },
        });

        let new_password = "";
        for (let i = 0; i < 6; i++) {
          new_password += Math.floor(Math.random() * 10);
        }
        
        const updatePassword = await prisma.users.updateMany({
          where: {
            email: email,
          },
          data: {
            password: md5(new_password),
          },
        });              

        const transporter = nodemailer.createTransport({
          service: "gmail",
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
          to: `${email}`,
          subject: "Reset Password",
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password</title>
                ${email_style.email_style()}
            </head>
            <body>
                <div class="container">
                    <h1>Reset Password</h1>
                    <p>Salam sejahtera,</p>
                    <p>Kami dari Instansi Lestari ingin memberitahu Anda bahwa reset password pada akun Anda telah berhasil. Berikut adalah akun Anda yang baru:</p>
                    <ul>
                        <li><strong>Tanggal Reset Password:</strong> ${formattedDateTime}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Password:</strong> ${new_password}</li>
                    </ul>
                    <p><strong>Perhatian:</strong> Password harap segera diganti untuk keamanan akun Anda.</p>
                    <p>Terima kasih telah menggunakan layanan kami. Jika Anda memiliki pertanyaan lebih lanjut, jangan ragu untuk menghubungi kami di nomor yang tercantum di bawah ini:</p>
                    <p>Salam hormat,</p>
                    <p>Tim Lestari</p>
                    <p>Contact: ${process.env.EMAIL} | Phone: <a href="${process.env.PHONE_WA}">${process.env.PHONE_FORMATTED}</a></p>
                </div>
            </body>
            </html>
          `,
        };

        // Kirim email notifikasi reset password
        await transporter.sendMail(msg);

        return res.status(200).json({ status: 200, message: "Password berhasil direset, cek email anda" });
      }
    } else {
      res.status(400).send("Masukkan Email");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ status: 500, message: "Terjadi kesalahan sistem" });
  }
};