const emailExistingCheck = async (email) => {
  const countEmailExisting = await userMdl.user.countDocuments({ email });

  if (countEmailExisting > 0) {
    return true;
  }
  return false;
};

const customRegisterValidation = async (req, res, next) => {
  const { name, email, password } = req.body;

  //   console.log(password.length);
  //   console.log(password.length < 6);
  //   console.log(password.length > 18);

  if (!name) {
    const error = new Error("name is required");
    error.status = 400;
    return next(error);
  } else if (name.length < 1) {
    const error = new Error("name can't be null");
    error.status = 400;
    return next(error);
  }

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

    if (emailExistCheck) {
      const error = new Error("USER ALREADY EXIST");
      error.status = 400;
      return next(error);
    }
  }

  if (!password) {
    const error = new Error("Password is required");
    error.status = 400;
    return next(error);
  } else if (password.length < 6 || password.length > 18) {
    const error = new Error("Password must be 6 digit short and 18 digit long");
    error.status = 400;
    return next(error);
  }

  next();
};

export default {
  customRegisterValidation,
};
