import pool from "../config/db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

/* ================= CREATE ADMIN ================= */
export const createUserAdmin = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      id_number,
      phone_number,
      alt_phone_number,
      password,
      role,
    } = req.body;

    /* 1. Validation */
    if (!first_name || !last_name || !email || !id_number || !phone_number || !password) {
      return res.status(400).json({
        error: "All required fields must be filled",
      });
    }

    /* 2. Email check */
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    /* 3. Name check */
    const nameCheck = await pool.query(
      "SELECT id FROM users WHERE first_name = $1 AND last_name = $2",
      [first_name, last_name]
    );

    if (nameCheck.rows.length > 0) {
      return res.status(409).json({
        error: "User with this name already exists",
      });
    }

    /* 4. Hash password (saltRounds RESTORED) */
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    /* 5. Insert user */
    const result = await pool.query(
      `
      INSERT INTO users
      (first_name, last_name, role, email, phone_number, alt_phone_number, id_number, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, first_name, last_name, email, role
      `,
      [
        first_name,
        last_name,
        role || "admin",
        email,
        phone_number,
        alt_phone_number,
        id_number,
        hashedPassword,
      ]
    );

    return res.status(201).json({
      message: "Admin account created successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Create admin error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ================= CREATE LANDLORD ================= */
export const createUserLandlord = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      id_number,
      phone_number,
      alt_phone_number,
      password,
      role,
      ref,
    } = req.body;

    if (!first_name || !last_name || !email || !phone_number || !password || !id_number) {
      return res.status(400).json({
        error: "All required fields must be filled",
      });
    }

    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `
      INSERT INTO users
      (first_name, last_name, role, email, phone_number, alt_phone_number, id_number, password_hash, reference)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id, first_name, last_name, email, role
      `,
      [
        first_name,
        last_name,
        role || "landlord",
        email,
        phone_number,
        alt_phone_number,
        id_number,
        hashedPassword,
        ref,
      ]
    );

    return res.status(201).json({
      message: "Landlord created successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Create landlord error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ================= CREATE TENANT ================= */
export const createUserTenant = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      role,
      email,
      id_number,
      phone_number,
      alt_phone_number,
      apartment_name,
      house_number,
      password,
      reference,
    } = req.body;

    if (!first_name || !last_name || !email || !id_number || !phone_number || !password) {
      return res.status(400).json({
        error: "All required fields must be filled",
      });
    }

    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
      `
      INSERT INTO users
      (first_name, last_name, role, email, phone_number, alt_phone_number, id_number, password_hash, apartment_name, house_number, reference)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        first_name,
        last_name,
        role || "tenant",
        email,
        phone_number,
        alt_phone_number,
        id_number,
        hashedPassword,
        apartment_name,
        house_number,
        reference,
      ]
    );

    return res.status(201).json({
      message: "Tenant created successfully",
    });

  } catch (error) {
    console.error("Create tenant error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ================= FETCH USERS ================= */
export const fetchUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, first_name, last_name, role, email,
             phone_number, alt_phone_number,
             id_number, apartment_name, house_number,
             reference, is_verified, status, created_at
      FROM users
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("Fetch users error:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
