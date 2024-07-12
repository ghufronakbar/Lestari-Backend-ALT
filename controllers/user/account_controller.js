"use strict";

const path = require("path");
const multer = require("multer");
const md5 = require("md5");
const nodemailer = require("nodemailer");
const email_style = require('../../lib/email_style');


const { PrismaClient } = require('@prisma/client');
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
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const results = {
      id_user: userData.id_user,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      picture: userData.picture
        ? `${baseUrl}/v1/mob/image/profile/${userData.picture}`
        : `${baseUrl}/v1/mob/image/profile/default.png`,
    };

    return res.status(200).json({ status: 200, values: results });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
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
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const oldPassword = md5(password);

    if (oldPassword === userData.password) {
      return res.status(200).json({ match: true });
    } else {
      return res.status(200).json({ match: false });
    }
  } catch (error) {
    console.error("Error checking password:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
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

    return res.status(200).json({ status: 200, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
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
    const now = new Date();
    const date_now = now.toISOString(); // Menggunakan ISO string untuk format tanggal

    await prisma.request_accounts.create({
      data: {
        name,
        email,
        phone,
        profession,
        instances,
        subject,
        body,
        date: date_now,
        approve: 0,
      },
    });

    return res.status(200).json({ keterangan: "berhasil menambah data" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.mobaccounteditname = async (req, res) => {
  const { name } = req.body;
  const id_user = req.decoded.id_user;

  try {
    const now = new Date();
    const date_now = now.toISOString(); // Menggunakan ISO string untuk format tanggal

    await prisma.users.update({
      where: {
        id_user: id_user,
      },
      data: {
        name,
        updated_at: date_now,
      },
    });

    return res.status(200).json({ status: 200, keterangan: "berhasil mengedit data" });
  } catch (error) {
    console.error("Error editing user data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.mobaccounteditpicture = async (req, res) => {
  const { picture } = req.body;
  const id_user = req.decoded.id_user;

  try {
    const now = new Date();
    const date_now = now.toISOString(); // Menggunakan ISO string untuk format tanggal

    await prisma.users.update({
      where: {
        id_user: id_user,
      },
      data: {
        picture,
        updated_at: date_now,
      },
    });

    return res.status(200).json({ status: 200, message: "Profile picture updated successfully" });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ error: "Internal Server Error" });
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
      return res.status(404).send("User not found");
    }

    const uploadDirectory = path.join(__dirname, '..', '..', 'upload', 'profiles');

    let fileName;
    if (user.picture) {
      // Menggunakan modul url untuk mengurai URL
      const parsedUrl = new URL(user.picture);
      // Menggunakan modul path untuk mendapatkan nama file dari path
      fileName = path.basename(parsedUrl.pathname);
    } else {
      // Jika gambar tidak ada atau null, generate nama file baru
      const datetime = new Date().toISOString().replace(/[-T:\.Z]/g, "");
      fileName = `${user.name}_${datetime}.jpg`;
    }

    // storage engine
    const storage = multer.diskStorage({
      destination: uploadDirectory,
      filename: (req, file, cb) => {
        cb(null, fileName);
      },
    });

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB (dalam bytes)
      },
    }).single("image");

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // Jika terjadi kesalahan dari multer (misalnya melebihi batas ukuran file)
        return res.json({
          success: 0,
          message: err.message,
        });
      } else if (err) {
        // Jika terjadi kesalahan lainnya
        return res.json({
          success: 0,
          message: "Terjadi kesalahan saat mengunggah gambar",
        });
      }

      // Update database dengan nama file baru
      await prisma.users.update({
        where: {
          id_user: id_user,
        },
        data: {
          picture: fileName,
        },
      });

      res.json({
        success: 200,
        image_url: fileName,
      });
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).send("Internal Server Error");
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
      return res.status(404).json({ status: 404, message: "User not found" });
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

      return res.status(200).json({ status: 200, message: "Password updated successfully" });
    } else {
      return res.status(400).json({ status: 400, message: "Old password is incorrect" });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

exports.mobforgotpassword = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!otp && email) {
      const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(400).send(`${email} Is Not User!`);
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
        message: `OTP Sent To Email ${email}`,
      });
    } else if (email && otp) {
      const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return res.status(400).send(`${email} Is Not User!`);
      }

      const otpData = await prisma.otps.findFirst({
        where: {
          email: email,
          id_otp: {
            equals: prisma.raw`SELECT MAX(id_otp) FROM otps WHERE email = ${email}`,
          },
        },
      });

      if (!otpData) {
        return res.status(400).send("No OTP Found!");
      }

      const confirmation_used = otpData.used;
      const confirmation_otp = otpData.otp;
      const expired_at = new Date(otpData.expired_at);
      const currentTime = new Date();

      if (confirmation_used === 1) {
        return res.status(400).send("OTP Has Been Used!");
      } else if (confirmation_otp !== otp) {
        return res.status(400).send("OTP Incorrect!");
      } else if (currentTime > expired_at) {
        return res.status(400).send("OTP Has Been Expired!");
      } else if (currentTime < expired_at) {
        await prisma.otps.updateMany({
          where: {
            email: email,
            id_otp: {
              equals: prisma.raw`SELECT MAX(id_otp) FROM otps WHERE email = ${email}`,
            },
          },
          data: {
            used: 1,
          },
        });

        let new_password = "";
        for (let i = 0; i < 6; i++) {
          new_password += Math.floor(Math.random() * 10);
        }

        await prisma.users.update({
          where: {
            email: email,
          },
          data: {
            password: md5(new_password),
          },
        });

        const formattedDateTime = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")} ${day}, ${currentTime.getDate()} ${month} ${currentTime.getFullYear()}`;

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

        return res.status(200).json({ status: 200, message: "Password has been reset" });
      }
    } else {
      res.status(400).send("Insert Email!");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};