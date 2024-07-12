"use strict";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const ip = require("ip");

exports.login = async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        Error: true,
        Message: "Email atau Password Salah!",
      });
    }

    // Verify password
    if (user.password !== md5(password)) {
      return res.status(404).json({
        Error: true,
        Message: "Email atau Password Salah!",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id_user: user.id_user }, process.env.JWT_SECRET, {
      expiresIn: '12h', // 43200 seconds
    });

    // Update refresh_token and ip_address
    const updateUserData = {
      refresh_token: token,
      ip_address: ip.address(),
    };

    const updatedUser = await prisma.users.update({
      where: {
        id_user: user.id_user,
      },
      data: updateUserData,
    });

    res.json({
      success: true,
      message: "Token JWT Generated!",
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      Error: true,
      Message: "Internal Server Error",
    });
  }
};

exports.check_user = async function (req, res) {
  const id_user = req.decoded.id_user;

  try {
    const user = await prisma.users.findFirst({
      where: {
        id_user: id_user,
      },
      select: {
        id_user: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        Error: true,
        Message: "User not found",
      });
    }

    res.status(200).json({
      status: 200,
      id_user: user.id_user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      Error: true,
      Message: "Internal Server Error",
    });
  }
};
