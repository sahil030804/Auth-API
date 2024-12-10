import userMdl from "../../schemas/userMdl.js";
import authHelper from "../../helper/authHelper.js";

const emailExistingCheck = async (email) => {
  const countEmailExisting = await userMdl.user.countDocuments({ email });

  if (countEmailExisting > 0) {
    return true;
  }
  return false;
};

const customLoginValidation = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    const error = new Error("EMAIL_REQUIRED");
    return next(error);
  } else if (!email.includes("@")) {
    const error = new Error("INVALID_EMAIL");
    return next(error);
  } else {
    const emailExistCheck = await emailExistingCheck(email);

    if (!emailExistCheck) {
      const error = new Error("USER_NOT_FOUND");
      return next(error);
    }
  }

  const foundUserInDb = await userMdl.user.findOne({ email });
  //   console.log(foundUserInDb);

  if (!password) {
    const error = new Error("PASSWORD_REQUIRED");
    return next(error);
  } else if (!authHelper.decryptPassword(password, foundUserInDb.password)) {
    const error = new Error("INVALID_PASSWORD");
    return next(error);
  }

  next();
};

const customRegisterValidation = async (req, res, next) => {
  const { name, email, password } = req.body;

  //   console.log(password.length);
  //   console.log(password.length < 6);
  //   console.log(password.length > 18);

  if (!name) {
    const error = new Error("NAME_REQUIRED");
    return next(error);
  } else if (name.length < 1) {
    const error = new Error("NAME_NOT_NULL");
    return next(error);
  }

  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email) {
    const error = new Error("EMAIL_REQUIRED");
    return next(error);
  } else if (!pattern.test(email)) {
    const error = new Error("INVALID_EMAIL");
    return next(error);
  } else {
    const emailExistCheck = await emailExistingCheck(email);

    if (emailExistCheck) {
      const error = new Error("USER_EXIST");
      return next(error);
    }
  }

  if (!password) {
    const error = new Error("PASSWORD_REQUIRED");
    return next(error);
  } else if (password.length < 6 || password.length > 18) {
    const error = new Error("INVALID_PASSWORD");
    return next(error);
  }

  next();
};

export default {
  customLoginValidation,
  customRegisterValidation,
};
