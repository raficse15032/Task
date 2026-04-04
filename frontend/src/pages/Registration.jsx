import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../api/authService';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  agreeTerms: false,
};

function validate(form) {
  const errors = {};
  if (!form.first_name.trim()) errors.first_name = 'First name is required.';
  if (!form.last_name.trim()) errors.last_name = 'Last name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  if (!form.password_confirmation) {
    errors.password_confirmation = 'Please confirm your password.';
  } else if (form.password !== form.password_confirmation) {
    errors.password_confirmation = 'Passwords do not match.';
  }
  if (!form.agreeTerms) errors.agreeTerms = 'You must agree to terms & conditions.';
  return errors;
}

export default function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      if (response.data?.success) {
        toast.success(response.data.message || 'Registration successful!');
        navigate('/login');
      }
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        Object.entries(serverErrors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(mapped);
      } else {
        const message = error.response?.data?.message || 'Registration failed.';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/assets/images/registration.png" alt="Registration illustration" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/assets/images/registration1.png" alt="Registration illustration dark" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src="/assets/images/logo.svg" alt="Logo" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <img src="/assets/images/google.svg" alt="Google" className="_google_img" />
                  <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>
                <form className="_social_registration_form" onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.first_name ? ' is-invalid' : ''}`}
                        />
                        {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.last_name ? ' is-invalid' : ''}`}
                        />
                        {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.email ? ' is-invalid' : ''}`}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.password ? ' is-invalid' : ''}`}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">Repeat Password</label>
                        <input
                          type="password"
                          name="password_confirmation"
                          value={form.password_confirmation}
                          onChange={handleChange}
                          className={`form-control _social_registration_input${errors.password_confirmation ? ' is-invalid' : ''}`}
                        />
                        {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className={`form-check-input _social_registration_form_check_input${errors.agreeTerms ? ' is-invalid' : ''}`}
                          type="checkbox"
                          id="agreeTerms"
                          name="agreeTerms"
                          checked={form.agreeTerms}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="agreeTerms"
                        >
                          I agree to terms &amp; conditions
                        </label>
                        {errors.agreeTerms && <div className="invalid-feedback d-block">{errors.agreeTerms}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}
                          disabled={loading}
                        >
                          {loading ? 'Registering...' : 'Register now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{' '}
                        <Link to="/login">Login</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
