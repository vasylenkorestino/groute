import React, { useState, useContext } from 'react';

import { AuthContext } from '../../contexts/AuthContext' 
import { useNavigate } from 'react-router-dom'

import { Button } from 'rsuite';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {

    const navigate = useNavigate()

    const { login } = useContext(AuthContext)

    const [form, setForm ] = useState({ email: '', password: '' });

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name] : event.target.value})
    }

    const handleLogin = async () => {
        try {
            
            console.log('form : ', form)

            const response = await fetch('api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ ...form }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            data.status === 'success' ? toast.success(data.message) : toast.error(data.message)

            login(data.session, data.userId, data.isAdmin, data.userName)

            data.status === 'success' ? navigate('/') : navigate('/login')

        } catch(error){
            console.error(error)
        }
    }

    return (
        <div>
            <ToastContainer />
            <section className="vh-100 gradient-custom">
                <div className="container py-5 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                            <div className="" style={{ borderRadius: "1rem" }}>
                                <div className="card-body p-5 text-center">
                                    <form onSubmit={ e => e.preventDefault() }>
                                        <div className="mb-md-5 mt-md-4 pb-0">
                                            <h2 className="fw-bold mb-4 text-uppercase">Login</h2>

                                            <div className="form-outline form-white mb-4">
                                                <input className="form-control form-control-lg"
                                                       name="email" 
                                                       type="email" 
                                                       placeholder="Email" 
                                                       onChange={ handleChange } />
                                            </div>

                                            <div className="form-outline form-white mb-4">
                                                <input className="form-control form-control-lg"
                                                       name="password" 
                                                       type="password" 
                                                       placeholder="Password" 
                                                       onChange={ handleChange } />
                                            </div>

                                            <button className="btn btn-outline-light mt-4 btn-lg px-5" type="submit" onClick={ handleLogin }>Login</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
