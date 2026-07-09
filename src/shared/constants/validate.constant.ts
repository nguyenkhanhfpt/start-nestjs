export const ValidateConstant = {
  REGEX_EMAIL:
    /^[A-Za-z0-9](?:(?:[A-Za-z0-9][-_+.])*[A-Za-z0-9])*@(?!([0-9]{1,3}\.){3}[0-9]{1,3}\b)(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?$/,
  REGEX_USERNAME: /^[a-zA-Z0-9_]+$/,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MAX_LENGTH: 20,
  MAX_LENGTH_500: 500,
  REGEX_LINE_MATCH: /at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/,
};
