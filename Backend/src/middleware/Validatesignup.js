
//validation  for  sign  up 
export function validateSignup(req, res, next) {
  const { full_name, email, password } = req.body;  

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
 if (!/^[^\s@]+@student\.cadt\.edu\.kh$/.test(email)) {
    return res.status(400).json({ error: 'Email must be a valid @student.cadt.edu.kh address' });
}
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  } 
    next();
}