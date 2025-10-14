import axios from "axios";

export default async function handler(req, res) {
  try {
    const { method, body } = req;

    if (method === "POST") {
      const response = await axios.post("http://44.203.195.247:3000/login", body);
      return res.status(response.status).json(response.data);
    }

    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
}
