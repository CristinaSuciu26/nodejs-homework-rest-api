import User from "./userSchema.js";

const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

const createUser = async (userData) => {
  const user = new User(userData);
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

const UsersService = {
  findUserByEmail,
  createUser,
  updateUserToken,
  getUserById,
};

export default UsersService;
