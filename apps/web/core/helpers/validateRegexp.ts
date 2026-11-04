export const validateRegexp = {
  email: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
  login: "^[a-zA-Z0-9]{4,15}$",
  passwordSignUp: "^[\\x20-\\x7e]{8,64}$",
  passwordSignIn: "^.{1,}$",
  code: "^[0-9]{6}$",
};
