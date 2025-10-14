import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Faz proxy para a API real
    const response = await axios.post(
      "https://44.203.195.247:3000/login", // sua AWS HTTPS
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000, // evita travar se a AWS demorar
      }
    );

    // Retorna o que a AWS devolveu
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Erro ao chamar a AWS:", error.message);

    // Retorna erro amigável
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Erro ao efetuar login",
    });
  }
}
