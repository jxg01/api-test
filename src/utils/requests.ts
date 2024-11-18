import axios from 'axios';

const request = axios.create({
    baseURL: "",
    timeout: 80000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})
