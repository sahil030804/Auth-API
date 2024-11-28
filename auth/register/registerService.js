import userMdl from "../../schemas/userMdl.js";
import utils from "../utils/utils.js";

const emailExistingCheck = async (email) => {
  const countEmailExisting = await userMdl.user.countDocuments({ email });
  console.log(countEmailExisting);

  if (countEmailExisting > 0) {
    return true;
  }
  return false;
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const emailExistCheck = await emailExistingCheck(email);
    console.log(emailExistCheck);

    if (emailExistCheck) {
      const error = new Error("USER ALREADY EXISTtttttttt");
      error.status = 400;
      throw error;
    }

    const userData = await userMdl.user({
      name: name,
      email: email,
      password: password,
      registeredAt: new Date().toISOString(),
    });

    const newUser = await userData.save();

    const accessToken = await utils.generateAccessToken(newUser._id);
    const refreshToken = await utils.generateRefreshToken(newUser._id);

    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    return { newUser, accessToken: accessToken, refreshToken: refreshToken };
  } catch (err) {
    const error = new Error(err.message);
    error.status = 400;
    throw error;
  }
};

export default { registerUser };
