const express = require("express");
const router = express.Router();
const role = require("../middleware/role.middleware");

const adminController = require("../controllers/admin.controller");
const auth = require("../middleware/Auth.middleware");

router.get("/records", auth, role(["organization"]), adminController.records);

router.get("/singleUser/:id", auth, adminController.singleUser);

module.exports = router;
