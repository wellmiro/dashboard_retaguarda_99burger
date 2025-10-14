import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const response = await axios.post(
        "http://44.203.195.247:3000/login",
        req.body
      );
      return res.status(response.status).json(response.data);
    }

    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
