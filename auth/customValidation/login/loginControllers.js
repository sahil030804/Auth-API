import loginServices from "./loginServices.js";

const loginUser = async (req, res, next) => {
  try {
    const login = await loginService.loginUser(req, res);
    res.status(200).json(login);
  } catch (error) {
    next(error);
  }
};

const logOutUser = async (req, res, next) => {
  try {
    const logout = await loginService.logOutUser(req, res, next);

    res.status(200).json(logout);
  } catch (error) {
    next(error);
  }
};

export default { loginUser, logOutUser };
