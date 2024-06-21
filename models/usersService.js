import User from "./userSchema.js";
import gravatar from "gravatar";

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const createUser = async (userData) => {
  const { email, password, verificationToken } = userData;
  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
  const user = new User({
    email,
    password,
    avatarURL,
    verificationToken,
  });
  const savedUser = await user.save();
  return savedUser;
};

const getUserById = async (userId) => {
  return User.findById(userId);
};
const updateUserToken = async (userId, token) => {
  const result = await User.findByIdAndUpdate(userId, { token }, { new: true });
  return result;
};

const updateUserAvatar = async (userId, avatarURL) => {
  return User.findByIdAndUpdate(userId, { avatarURL }, { new: true });
};

const findUserByVerificationToken = async (verificationToken) => {
  return User.findOne({ verificationToken });
};

const verifyUser = async (userId) => {
  return User.findByIdAndUpdate(
    userId,
    { verificationToken: " ", verify: true },
    { new: true, runValidators: true }
  );
};
const UsersService = {
  findUserByEmail,
  createUser,
  updateUserToken,
  getUserById,
  updateUserAvatar,
  findUserByVerificationToken,
  verifyUser,
};

export default UsersService;
