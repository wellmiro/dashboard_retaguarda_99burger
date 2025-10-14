import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      // 🔒 Use HTTPS aqui — a AWS aceita requisição por https
      const response = await axios.post(
        "https://44.203.195.247:3000/login", // <-- mudou http → https
        req.body
      );

      return res.status(response.status).json(response.data);
    }

    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data?.error || error.message });
  }
}
