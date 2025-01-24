const express = require("express");
const router = express.Router();

const aiFlashCardController = require("../controllers/aiFlashCardController");

// POST
router.post("/", aiFlashCardController.createCard);

// GET
router.get("/", aiFlashCardController.fetchCard);

// DELETE
router.delete("/:id", aiFlashCardController.deleteCard);

// UPDATE
router.put("/:id", aiFlashCardController.updateCard);

module.exports = router;
