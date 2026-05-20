/**
 * RegisterPage — Purple gradient background, form validation, Bootstrap styled.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (!validate()) return;

    setLoading(true);

    try {
      await register(formData.fullName, formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-register">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5 col-xl-5">
            <div className="auth-card card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                {/* Title */}
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-dark mb-1">Create Account</h3>
                  <p className="text-muted small">Fill in the details to get started</p>
                </div>

                {/* General Error */}
                {errors.general && (
                  <div className="alert alert-danger py-2 small">{errors.general}</div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label htmlFor="reg-name" className="form-label small fw-medium">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <User size={16} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className={`form-control border-start-0 ps-0 ${validated && errors.fullName ? 'is-invalid' : validated && !errors.fullName ? 'is-valid' : ''}`}
                        id="reg-name"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                      {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="reg-email" className="form-label small fw-medium">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Mail size={16} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className={`form-control border-start-0 ps-0 ${validated && errors.email ? 'is-invalid' : validated && !errors.email ? 'is-valid' : ''}`}
                        id="reg-email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="reg-password" className="form-label small fw-medium">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={16} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className={`form-control border-start-0 ps-0 ${validated && errors.password ? 'is-invalid' : validated && !errors.password ? 'is-valid' : ''}`}
                        id="reg-password"
                        name="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label htmlFor="reg-confirm-password" className="form-label small fw-medium">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <CheckCircle size={16} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className={`form-control border-start-0 ps-0 ${validated && errors.confirmPassword ? 'is-invalid' : validated && !errors.confirmPassword ? 'is-valid' : ''}`}
                        id="reg-confirm-password"
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>

                  {/* Terms of Service */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${validated && errors.agreeTerms ? 'is-invalid' : ''}`}
                        type="checkbox"
                        id="agree-terms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                      <label className="form-check-label small" htmlFor="agree-terms">
                        I agree to the <a href="#" className="text-decoration-none" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#" className="text-decoration-none" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                      </label>
                      {errors.agreeTerms && <div className="invalid-feedback">{errors.agreeTerms}</div>}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    id="register-button"
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    ) : null}
                    Create Account
                  </button>
                </form>

                {/* Login link */}
                <div className="text-center mt-4">
                  <span className="text-muted small">Already have an account? </span>
                  <Link to="/login" className="small fw-semibold text-decoration-none">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
