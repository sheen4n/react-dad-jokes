import axios from 'axios';

axios.defaults.baseURL = 'https://icanhazdadjoke.com/';

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete
};
