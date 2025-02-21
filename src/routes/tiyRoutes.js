const express = require("express");
const { getTIYS, getTIYByID, softDeleteTIY } = require("../controllers/TIYController");
const router = express.Router();

router.get("/get",getTIYS);
router.get("/get/single/:id",getTIYByID);
router.delete("/softdelete/:id",softDeleteTIY);

module.exports = router;