const Faq = require("../Models/faqModel");

exports.getFaq = async (req, res) => {
    try {
        const faq = await Faq.find();
        res.status(200).json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;

        if(!question || !answer) {
            return res.status(400).json({error: "Question and answer are required"});
        }
        const faq = new Faq({ question, answer });
        await faq.save();
        res.status(201).json({ message: "FAQ created successfully", faq });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await Faq.findByIdAndDelete(id);
        if (!faq) {
            return res.status(404).json({ message: "FAQ not found" });
        }
        res.status(200).json({ message: "FAQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const faq = await Faq.findByIdAndUpdate(
            id,
            { question, answer },
            { new: true }
        );
        if (!faq) {
            return res.status(404).json({ message: "FAQ not found" });
        }
        res.status(200).json({ message: "FAQ updated successfully", faq });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

