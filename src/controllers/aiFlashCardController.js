const NewCard = require("../Models/aiFlashCardModel");

// Creation of New Card
exports.createCard = async (req, res) => {
  try {
    {
      const newCard = new NewCard(req.body);
      await newCard.save();
      res.status(201).json({
        success: true,
        message: "New Card creation successful",
        data: newCard,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create new card",
      error: err.message,
    });
  }
};

// Fetching all cards
exports.fetchCard = async (req, res) => {
  try {
    {
      const cardData = await NewCard.find();

      res.status(200).json({
        success: true,
        data: cardData,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cards",
      error: err.message,
    });
  }
};

// Updating a card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardContent } = req.body;

    if (!cardContent) {
      return res.status(400).json({
        success: false,
        message: "Card Content is required to update",
      });
    }

    const cardData = await NewCard.findByIdAndUpdate(
      id,
      { cardContent },
      { new: true, runValidators: true }
    );

    if (!cardData) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Card updated successfully",
      data: cardData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update card",
      error: err.message,
    });
  }
};

// Deleting a card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const cardData = await NewCard.findByIdAndDelete(id);

    if (!cardData) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete card",
      error: err.message,
    });
  }
};
