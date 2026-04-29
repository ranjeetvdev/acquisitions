const COOKIE_MAX_AGE = Number.isFinite(Number(process.env.COOKIE_MAX_AGE))
  ? Number(process.env.COOKIE_MAX_AGE)
  : 15 * 60 * 1000; // 15 minutes in milliseconds

export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  }),

  set: (res, name, value, options = {}) =>
    res.cookie(name, value, { ...cookies.getOptions(), ...options }),

  clear: (res, name, options = {}) =>
    res.clearCookie(name, { ...cookies.getOptions(), ...options }),

  get: (req, name) => req.cookies?.[name],
};
