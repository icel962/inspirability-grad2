console.log(process.env.GEMINI_API_KEY);
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

exports.chatBot = async (req, res) => {

  try {

    const { message } = req.body;

    const model = genAI.getGenerativeModel({
       model: "gemini-3-flash-preview",
    });

    const prompt = `
You are Inspirability AI assistant.

You help parents find:
- schools
- clinics
- sport centers

for children with special needs.

Reply in friendly short helpful language.

User: ${message}
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    res.json({
      reply: response,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Gemini AI error",
    });

  }
};