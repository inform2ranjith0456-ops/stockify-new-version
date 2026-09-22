import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { authMiddleware, managerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "stockify_super_secret_key_2026";

// ======================================================
// REGISTER NEW ACCOUNT
// Requirement 5: Username must be used instead of Full Name
// Requirement 6: Duplicate email rejected with "Email already exists."
// Passwords hashed with bcrypt
// ======================================================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role = "MANAGER", storeId, roleId } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists (Exact requirement: "Email already exists.")
    const existingEmail = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [trimmedEmail]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Check if username already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(username) = $1",
      [trimmedUsername]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different username.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-generate role_id if not provided
    const userRole = role === "STAFF" ? "STAFF" : "MANAGER";
    const assignedRoleId = roleId || (userRole === "MANAGER"
      ? `MGR-${Math.floor(1000 + Math.random() * 9000)}`
      : `STF-${Math.floor(1000 + Math.random() * 9000)}`);

    const assignedStoreId = userRole === "STAFF" && storeId ? parseInt(storeId, 10) : null;

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, name, email, password, role, role_id, store_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
       RETURNING id, username, name, email, role, role_id AS "roleId", store_id AS "storeId", created_at AS "createdAt"`,
      [trimmedUsername, username, trimmedEmail, hashedPassword, userRole, assignedRoleId, assignedStoreId]
    );

    const newUser = result.rows[0];

    // Fetch store name if staff
    let storeName = null;
    let storeCode = null;
    if (newUser.storeId) {
      const storeRes = await pool.query("SELECT name, code FROM stores WHERE id = $1", [newUser.storeId]);
      if (storeRes.rows.length > 0) {
        storeName = storeRes.rows[0].name;
        storeCode = storeRes.rows[0].code;
      }
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        roleId: newUser.roleId,
        storeId: newUser.storeId,
        storeName,
        storeCode,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        ...newUser,
        storeName,
        storeCode,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// ======================================================
// LOGIN
// Requirement 3: Real validation against database
// Wrong credentials -> "Invalid credentials"
// ======================================================
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const identifier = username.trim().toLowerCase();

    // Query user by username or email
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.password, u.role, u.role_id AS "roleId",
              u.store_id AS "storeId", u.status,
              s.name AS "storeName", s.code AS "storeCode"
       FROM users u
       LEFT JOIN stores s ON s.id = u.store_id
       WHERE LOWER(u.username) = $1 OR LOWER(u.email) = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    // Check account status
    if (user.status && user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact your manager.",
      });
    }

    // Role check if requested specifically
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        storeId: user.storeId,
        storeName: user.storeName,
        storeCode: user.storeCode,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password before sending
    delete user.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ======================================================
// GET CURRENT USER PROFILE (/me)
// Maintains authenticated state on page refresh
// ======================================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.role, u.role_id AS "roleId",
              u.store_id AS "storeId", u.status,
              s.name AS "storeName", s.code AS "storeCode"
       FROM users u
       LEFT JOIN stores s ON s.id = u.store_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// ======================================================
// STAFF MANAGEMENT (Manager Only)
// ======================================================

// 1. Get All Staff Members
router.get("/staff", authMiddleware, managerOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.email, u.role, u.role_id AS "roleId",
              u.store_id AS "storeId", u.status, u.created_at AS "createdAt",
              s.name AS "storeName", s.code AS "storeCode"
       FROM users u
       LEFT JOIN stores s ON s.id = u.store_id
       WHERE u.role = 'STAFF'
       ORDER BY u.id ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff list",
    });
  }
});

// 2. Manager Creates New Staff Account
router.post("/staff", authMiddleware, managerOnly, async (req, res) => {
  try {
    const { username, name, email, password, storeId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existingEmail = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [trimmedEmail]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Check username uniqueness
    const existingUser = await pool.query("SELECT id FROM users WHERE LOWER(username) = $1", [trimmedUsername]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different username.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRoleId = `STF-${Math.floor(1000 + Math.random() * 9000)}`;
    const assignedStoreId = storeId ? parseInt(storeId, 10) : null;

    const result = await pool.query(
      `INSERT INTO users (username, name, email, password, role, role_id, store_id, status)
       VALUES ($1, $2, $3, $4, 'STAFF', $5, $6, 'ACTIVE')
       RETURNING id, username, name, email, role, role_id AS "roleId", store_id AS "storeId", created_at AS "createdAt"`,
      [trimmedUsername, name || username, trimmedEmail, hashedPassword, assignedRoleId, assignedStoreId]
    );

    const newStaff = result.rows[0];

    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, username, user_role, action, entity_type, entity_id, new_value, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user.id,
        req.user.username,
        req.user.role,
        "STAFF_ASSIGNED",
        "USER",
        String(newStaff.id),
        JSON.stringify({ staffUsername: newStaff.username, storeId: assignedStoreId }),
        JSON.stringify({ managerUsername: req.user.username, roleId: assignedRoleId }),
      ]
    ).catch((err) => console.warn("Audit log insert failed:", err.message));

    res.status(201).json({
      success: true,
      message: "Staff account created and assigned successfully",
      staff: newStaff,
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create staff account",
    });
  }
});

// 3. Manager Assigns / Reassigns Staff to Store
router.put("/staff/:id/assign", authMiddleware, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId } = req.body;

    const targetStoreId = storeId ? parseInt(storeId, 10) : null;

    // Verify staff exists
    const staffRes = await pool.query("SELECT * FROM users WHERE id = $1 AND role = 'STAFF'", [id]);
    if (staffRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const previousStoreId = staffRes.rows[0].store_id;

    // Verify store exists if assigned
    if (targetStoreId) {
      const storeCheck = await pool.query("SELECT id, name FROM stores WHERE id = $1", [targetStoreId]);
      if (storeCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Selected store not found",
        });
      }
    }

    const updateRes = await pool.query(
      `UPDATE users
       SET store_id = $1
       WHERE id = $2
       RETURNING id, username, name, email, role, role_id AS "roleId", store_id AS "storeId"`,
      [targetStoreId, id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, username, user_role, action, entity_type, entity_id, old_value, new_value, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        req.user.id,
        req.user.username,
        req.user.role,
        "STAFF_ASSIGNED",
        "USER",
        String(id),
        JSON.stringify({ previousStoreId }),
        JSON.stringify({ newStoreId: targetStoreId }),
        JSON.stringify({ managerUsername: req.user.username, staffUsername: staffRes.rows[0].username }),
      ]
    ).catch((err) => console.warn("Audit log insert failed:", err.message));

    res.json({
      success: true,
      message: "Staff store assignment updated successfully",
      staff: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Assign staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign staff",
    });
  }
});

// 4. Manager Deletes Staff Account
router.delete("/staff/:id", authMiddleware, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRes = await pool.query("DELETE FROM users WHERE id = $1 AND role = 'STAFF' RETURNING id, username", [id]);

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.json({
      success: true,
      message: `Staff account '${deleteRes.rows[0].username}' removed successfully`,
    });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove staff account",
    });
  }
});

export default router;