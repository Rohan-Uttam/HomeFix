// backend/middlewares/validateRequest.js

const isEmail = (s) => /^\S+@\S+\.\S+$/.test(String(s));

const typeCheckers = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && !Number.isNaN(v),
  boolean: (v) => typeof v === "boolean",
  array: (v) => Array.isArray(v),
  email: (v) => isEmail(v),
  object: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
};

function validateRequest(schema = {}) {
  return (req, res, next) => {
    try {
      const errors = [];
      const sections = ["params", "query", "body"];

      for (const sec of sections) {
        if (!schema[sec]) continue;

        // if req[sec] is not an object, treat as empty object (do NOT crash)
        const payload = req[sec] && typeof req[sec] === "object" ? req[sec] : {};

        for (const [field, rules] of Object.entries(schema[sec])) {
          const val = payload[field];

          if (rules.required && (val === undefined || val === null || val === "")) {
            errors.push(`${sec}.${field} is required`);
            continue;
          }

          if (val !== undefined && rules.type) {
            const checker = typeCheckers[rules.type];
            if (checker && !checker(val)) {
              errors.push(`${sec}.${field} must be of type ${rules.type}`);
            }
          }

          if (typeof val === "string") {
            if (rules.minLength && val.length < rules.minLength) {
              errors.push(`${sec}.${field} must be at least ${rules.minLength} characters`);
            }
            if (rules.maxLength && val.length > rules.maxLength) {
              errors.push(`${sec}.${field} must be at most ${rules.maxLength} characters`);
            }
          }
        }
      }

      if (errors.length) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
      }

      return next();
    } catch (err) {
      console.error("validateRequest crashed:", err);
      return res.status(500).json({ success: false, message: "Validation middleware error" });
    }
  };
}

export default validateRequest;
