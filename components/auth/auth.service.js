import userMdl from "../../schemas/userMdl.js";
import authHelper from "../../helper/authHelper.js";

//login
const loginUser = async (reqBody) => {
  try {
    const { email, password } = reqBody;

    const foundUserInDb = await userMdl.user.findOne({ email });

    if (!foundUserInDb) {
      const error = new Error("User not found");
      error.code = "USER_NOT_FOUND";
      error.status = 404;
      throw error;
    }

    if (password !== foundUserInDb.password) {
      const error = new Error("Invalid Password");
      error.code = "INVALID_PASSWORD";
      error.status = 401;
      throw error;
    }

    const accessToken = await authHelper.generateAccessToken(foundUserInDb._id);
    const refreshToken = await authHelper.generateRefreshToken(
      foundUserInDb._id
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (err) {
    const error = new Error(err.message);
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
    throw error;
  }
};

//logout
const logOutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const foundUserInDb = await userMdl.user.findOne({ _id: userId });

    if (!foundUserInDb) {
      const error = new Error("User not found");
      error.code = "USER_NOT_FOUND";
      error.status = 404;
      throw error;
    }

    foundUserInDb.refreshToken = null;
    await foundUserInDb.save();

    req.session.destroy((err) => {
      if (err) {
        const error = new Error(err.message);
        error.code = "ERR_LOGOUT";
        error.status = 400;
        throw error;
      }
    });

    res.clearCookie("connect.sid");
    return { message: "Logged out successfully." };
  } catch (err) {
    const error = new Error(err.message);
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
    throw error;
  }
};

//register

const emailExistingCheck = async (email) => {
  const countEmailExisting = await userMdl.user.countDocuments({ email });

  if (countEmailExisting > 0) {
    return true;
  }
  return false;
};

const registerUser = async (reqBody) => {
  try {
    const { name, email, password } = reqBody;

    const emailExistCheck = await emailExistingCheck(email);

    if (emailExistCheck) {
      const error = new Error("User already exist");
      error.code = "USER_EXIST";
      error.status = 409;
      throw error;
    }

    const userData = await userMdl.user({
      name: name,
      email: email,
      password: password,
      registeredAt: new Date().toISOString(),
    });

    const newUser = await userData.save();

    const accessToken = await authHelper.generateAccessToken(newUser._id);
    const refreshToken = await authHelper.generateRefreshToken(newUser._id);

    const newUserDetail = {
      name: newUser.name,
      email: newUser.email,
      registeredAt: newUser.registeredAt,
    };

    return {
      newUserDetail,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (err) {
    const error = new Error(err.message);
    if (err.name === "ValidationError") {
      err.code = "DB_ERR";
      err.status = 400;
    }
    error.code = err.code || "SERVER_ERR";
    error.status = err.status || 500;
    throw error;
  }
};

export default { loginUser, logOutUser, registerUser };
