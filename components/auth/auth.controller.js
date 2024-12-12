import authService from "./auth.service.js";

const registerUser = async (req, res, next) => {
  try {
    const tokenData = await authService.registerUser(req.body);
    // req.session.accessToken = tokenData.accessToken;
    // req.session.refreshToken = tokenData.refreshToken;
    res.status(201).json(tokenData);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const tokenData = await authService.loginUser(req.body);
    // req.session.accessToken = tokenData.accessToken;
    // req.session.refreshToken = tokenData.refreshToken;
    res.status(200).json(tokenData);
  } catch (error) {
    next(error);
  }
};

const logOutUser = async (req, res, next) => {
  try {
    const logout = await authService.logOutUser(req, res);

    res.status(200).json(logout);
  } catch (error) {
    next(error);
  }
};

export default { registerUser, loginUser, logOutUser };
