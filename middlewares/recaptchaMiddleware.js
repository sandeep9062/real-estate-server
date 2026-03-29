import axios from "axios";

export const validateRecaptcha = async (req, res, next) => {
  try {
    const recaptchaToken = req.body.recaptchaToken;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "reCAPTCHA configuration error.",
      });
    }

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const { success, score, action } = response.data;

    if (!success || score < 0.5 || action !== "contact_form") {
      return res.status(400).json({
        success: false,
        message: "Bot detected. Please try again.",
      });
    }

    // reCAPTCHA validation passed, continue to next middleware/controller
    next();
  } catch (error) {
    console.error("reCAPTCHA validation error:", error);
    res.status(500).json({
      success: false,
      message: "reCAPTCHA validation failed. Please try again.",
    });
  }
};
