const axios = require('axios');

exports.getJude0Languages = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: `${process.env.JUDGE_API_URL}/languages`,
            headers: {
                'x-rapidapi-key': process.env.JUDGE_API_KEY,
                'x-rapidapi-host': process.env.JUDGE_API_HOST
            }
        };

        try {
            const response = await axios.request(options);
            res.status(200).json(response.data);
            
        } catch (error) {
            console.error(error);
        }
       
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.submitCode = async (req, res) => {
    try {
        const options = {
            method: 'POST',
            url: `${process.env.JUDGE_API_URL}/submissions`,
            params: {
                base64_encoded: 'true',
                wait: 'false',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': process.env.JUDGE_API_KEY,
                'x-rapidapi-host': process.env.JUDGE_API_HOST,
                 'Content-Type': 'application/json'
            },
            data: req.body
        };

        try {    
            const response = await axios.request(options);
            res.status(200).json(response.data);
            
        } catch (error) {
            console.error(error);
        }       
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOutput = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: `${process.env.JUDGE_API_URL}/submissions/${req.body.code}`,
            params: {
                base64_encoded: 'true',
                wait: 'false',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': process.env.JUDGE_API_KEY,
                'x-rapidapi-host': process.env.JUDGE_API_HOST,
                'Content-Type': 'application/json',
            }
        };

        try {
            const response = await axios.request(options);
            res.status(200).json(response.data);    
            
        } catch (error) {
            console.error(error);
        }       
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

