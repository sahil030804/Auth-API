import userMdl from "../../schemas/userMdl.js";
import authHelper from "../../helper/authHelper.js";

//login
const loginUser = async (reqBody) => {
  try {
    const { email, password } = reqBody;

    const foundUserInDb = await userMdl.user.findOne({ email });

    if (!foundUserInDb) {
      const error = new Error("USER_NOT_FOUND");
      throw error;
    }

    if (!authHelper.decryptPassword(password, foundUserInDb.password)) {
      const error = new Error("INVALID_PASSWORD");
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
    throw error;
  }
};

//logout
const logOutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const foundUserInDb = await userMdl.user.findOne({ _id: userId });

    if (!foundUserInDb) {
      const error = new Error("USER_NOT_FOUND");
      throw error;
    }

    foundUserInDb.refreshToken = null;
    await foundUserInDb.save();

    req.session.destroy((err) => {
      if (err) {
        const error = new Error(err.message);
        throw error;
      }
    });

    res.clearCookie("connect.sid");
    return { message: "Logged out successfully." };
  } catch (err) {
    const error = new Error(err.message);
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
      const error = new Error("USER_EXIST");
      throw error;
    }

    if (password.length < 6 || password.length > 18) {
      const error = new Error("INVALID_PASSWORD");
      throw error;
    }

    const hashPassword = authHelper.encryptPassword(password);

    const userData = await userMdl.user({
      name: name,
      email: email,
      password: hashPassword,
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
    throw error;
  }
};

export default { loginUser, logOutUser, registerUser };
