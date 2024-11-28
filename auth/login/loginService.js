import userMdl from "../../schemas/userMdl.js";
import utils from "../utils/utils.js";

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const findUserInDb = await userMdl.user.findOne({ email });

  if (!findUserInDb) {
    const error = new Error("USER NOT EXIST");
    error.status = 400;
    throw error;
  }

  if (password !== findUserInDb.password) {
    const error = new Error("INVALID PASSWORD");
    error.status = 401;
    throw error;
  }

  const accessToken = await utils.generateAccessToken(findUserInDb._id);
  const refreshToken = await utils.generateRefreshToken(findUserInDb._id);

  req.session.accessToken = accessToken;
  req.session.refreshToken = refreshToken;

  // res.cookie("accessToken", accessToken);
  // res.cookie("refreshToken", refreshToken);

  return {
    message: `User ${findUserInDb.name} LoggedIn Successfully`,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const logOutUser = async (req, res, next) => {
  try {
    const userId = req.user;

    const findUserData = await userMdl.user.findOne({ _id: userId });

    if (!findUserData) {
      const error = new Error("USER NOT FOUND");
      error.status = 400;
      throw error;
    }

    findUserData.refreshToken = null;
    await findUserData.save();

    req.session.destroy((err) => {
      if (err) {
        const error = new Error("Something went wrong during logout.");
        error.status = 400;
        throw error;
      }
    });

    res.clearCookie("connect.sid");
    return { message: "Logged out successfully." };
  } catch (error) {
    const err = new Error("error while logout");
    err.status = 400;
    throw err;
  }
};
export default { loginUser, logOutUser };
