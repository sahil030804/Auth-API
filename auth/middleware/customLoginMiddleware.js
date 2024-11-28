import userMdl from "../../schemas/userMdl.js";

const emailExistingCheck = async (email) => {
  const countEmailExisting = await userMdl.user.countDocuments({ email });

  if (countEmailExisting > 0) {
    return true;
  }
  return false;
};

const customLoginValidation = async (req, res, next) => {
  const { email, password } = req.body;

  //   console.log(password.length);
  //   console.log(password.length < 6);
  //   console.log(password.length > 18);

  if (!email) {
    const error = new Error("Email id is required");
    error.status = 400;
    return next(error);
  } else if (!email.includes("@")) {
    const error = new Error("Email id is in invalid format");
    error.status = 400;
    return next(error);
  } else {
    const emailExistCheck = await emailExistingCheck(email);

    if (!emailExistCheck) {
      const error = new Error("USER DOES NOT EXIST");
      error.status = 400;
      return next(error);
    }
  }

  const userData = await userMdl.user.findOne({ email });
  //   console.log(userData);

  if (!password) {
    const error = new Error("Password is required");
    error.status = 400;
    return next(error);
  } else if (password !== userData.password) {
    const error = new Error("INVALID PASSWORD");
    error.status = 401;
    return next(error);
  }

  next();
};
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false }); // abortearly for stopping code to be exit when one error occur then show all errors in array in object
      next();
    } catch (error) {
      const errorMessage = error.details.map((detail) => detail.message);
      res.status(400).json({ error: errorMessage });
      console.log(errorMessage);
    }
  };
};

export default {
  customLoginValidation,
  validate,
};
