const isRequired = (value: string | number | boolean, onError: () => void) => {
  if (value === null || value === undefined || value === "") {
    onError();
    return false;
  }
  return true;
};

const isValidEmail = (email: string, onError: () => void) => {
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) {
    onError();
    return false;
  }
  return true;
};

const isLengthMoreThan = (
  minLength: number,
  value: string,
  onError: () => void
) => {
  if (value.length < minLength) {
    onError();
    return false;
  }
  return true;
};

export const serverValidation = {
  isRequired,
  isValidEmail,
  isLengthMoreThan
};
