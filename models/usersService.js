import User from "./userSchema.js";
import gravatar from "gravatar";

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const createUser = async (userData) => {
  const { email, password } = userData;
  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

  const user = new User({
    email,
    password,
    avatarURL,
  });
  return user.save();
};

const getUserById = async (userId) => {
  return User.findById(userId);
};
const updateUserToken = async (userId, token) => {
  console.log("Updating token for user:", userId, "with token:", token);
  const result = await User.findByIdAndUpdate(userId, { token }, { new: true });
  console.log("Update result:", result);
  return result;
};

const updateUserAvatar = async (userId, avatarURL) => {
  return User.findByIdAndUpdate(userId, { avatarURL }, { new: true });
};
const UsersService = {
  findUserByEmail,
  createUser,
  updateUserToken,
  getUserById,
  updateUserAvatar,
};

export default UsersService;
