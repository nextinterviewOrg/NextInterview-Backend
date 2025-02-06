const express = require("express");
const router = express.Router();
const faqController = require("../controllers/faqController");

router.get("/getFaq", faqController.getFaq);
router.post("/createFaq", faqController.createFaq);
router.delete("/deleteFaq/:id", faqController.deleteFaq);
router.put("/updateFaq/:id", faqController.updateFaq);

module.exports = router;

