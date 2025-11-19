//   Common validators

export function isEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isStrongPassword(password) {
  // At least 6 chars, 1 number, 1 special char
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
  return regex.test(password);
}

export function isRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== "";
}
