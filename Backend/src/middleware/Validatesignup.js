// Validation for sign up
export function validateSignup(req, res, next) {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = full_name.trim();

  // Allow @student.cadt.edu.kh and @cadt.edu.kh email addresses
  const isAllowedDomain = /^[^\s@]+@(?:student\.)?cadt\.edu\.kh$/.test(normalizedEmail);
  if (!isAllowedDomain) {
    return res.status(400).json({
      error: 'Email must be a valid @student.cadt.edu.kh or @cadt.edu.kh address',
    });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  req.body.email = normalizedEmail;
  req.body.full_name = trimmedName;

  next();
}