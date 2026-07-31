module.exports = (request, response) => {
  const country = String(request.headers["x-vercel-ip-country"] || "").toUpperCase();
  response.setHeader("Cache-Control", "private, no-store");
  response.status(200).json({
    country: country || null,
    language: country ? (country === "BR" ? "pt" : "en") : null
  });
};
