const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const auth = require("../middleware/Auth.middleware");

router.get("/records", auth,adminController.records ) 

router.get("/singleUser/:id", auth , adminController.singleUser) 

module.exports = router;
