const express = require("express");
const { getTIYS, getTIYByID, softDeleteTIY ,editTIYQuestion,geTIYByModuleCode} = require("../controllers/TIYController");
const router = express.Router();

router.get("/get",getTIYS);
router.get("/get/single/:id",getTIYByID);
router.delete("/softdelete/:id",softDeleteTIY);
router.put("/edit/:id",editTIYQuestion);
router.get("/get/module/:module_code",geTIYByModuleCode);

module.exports = router;