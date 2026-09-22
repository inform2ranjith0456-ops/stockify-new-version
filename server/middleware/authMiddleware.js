import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const secret = process.env.JWT_SECRET || "stockify_super_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
};

export const managerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "MANAGER") {
    return res.status(403).json({
      success: false,
      message: "Access restricted to Managers only.",
    });
  }
  next();
};

export const staffOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "STAFF") {
    return res.status(403).json({
      success: false,
      message: "Access restricted to Staff only.",
    });
  }
  next();
};

/**
 * Validates that if the caller is a STAFF user, they are only accessing/mutating
 * data for their own assigned store. Managers have universal store access.
 */
export const requireStoreAccess = (getStoreId = (req) => req.params.storeId || req.body.storeId || req.query.storeId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Managers have full access across all stores
    if (req.user.role === "MANAGER") {
      return next();
    }

    // Staff access is restricted to their assigned store
    if (req.user.role === "STAFF") {
      const targetStoreId = Number(getStoreId(req));
      const userStoreId = Number(req.user.storeId);

      if (!userStoreId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have an assigned store.",
        });
      }

      if (targetStoreId && targetStoreId !== userStoreId) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You are not assigned to this store.",
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  };
};

export default authMiddleware;