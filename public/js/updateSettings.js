import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    console.log(data)
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatepassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateuserdata';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    console.log(res.data)
    if (type==="password"){
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
            setTimeout(()=>{
              location.reload()
            },3000)
          }
    }else if (res.data.ststus === 'success') {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
        setTimeout(()=>{
          location.reload()
        },3000)
      }

    
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

