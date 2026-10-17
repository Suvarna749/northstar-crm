import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',timeout:15000,headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(config=>{const token=localStorage.getItem('crm_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401&&!e.config?.url?.includes('/auth/login')){localStorage.removeItem('crm_token');localStorage.removeItem('crm_user');if(window.location.pathname!=='/login')window.location.href='/login';}return Promise.reject(e);});
export const errorMessage=e=>e.response?.data?.error?.message||e.message||'Something went wrong';
export default api;
