import express from "express";
import { createUserAdmin, createUserLandlord, createUserTenant, fetchUsers } from "../controllers/users.controller.js";

const router = express.Router();

router.post("/admin", createUserAdmin);
router.post("/landlord", createUserLandlord);
router.post("/tenant", createUserTenant);
router.get("/", fetchUsers);

export default router;