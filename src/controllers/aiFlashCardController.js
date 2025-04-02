const NewCard = require("../Models/aiFlashCardModel");

// Creation of New Card
exports.createCard = async (req, res) => {
  try {
    {
      const newCard = new NewCard(req.body);
      console.log("newCard", newCard);
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
exports.updateCardStats = async (req, res) => {
  try {
    const { userId, cardId, cardKnow } = req.body;
    const cardData = await NewCard.findOne({ _id: cardId });

    if (!cardData) {
      return res.status(404).json({ success: false, message: "FlashCard not found" });
    }

    // Prepare the update object
    let updateObject = {
      $inc: {
        peopleInteractionCount: 1,  // Increment people interaction count
      },
      $addToSet: {  // Ensure user is added only once (no duplicates)
        interacted_users: userId,
      }
    };

    // Conditional increment based on cardKnow value
    if (cardKnow) {
      updateObject.$inc.cardKnown = (cardData.cardKnown || 0) + 1;  // Increment cardKnown if true
    } else {
      updateObject.$inc.cardUnknown = (cardData.cardUnknown || 0) + 1; // Increment cardUnknown if false
    }

    // Perform the update
    const updatedCardData = await NewCard.findOneAndUpdate(
      { _id: cardId },
      updateObject,
      { new: true, runValidators: true }
    );


    res.status(200).json({
      success: true,
      message: "Card Stats updated successfully",
      data: updatedCardData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update card stats",
      error: err.message,
    });
  }
};

exports.getCardsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const cards = await NewCard.find({   interacted_users: { $nin: [userId] } });

    res.status(200).json({
      success: true,
      data: cards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cards by user ID",
      error: err.message,
    });
  }
};