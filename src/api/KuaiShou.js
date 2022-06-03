import axios from "axios";

export function getBarrage(offset_time) {
  return axios.request({
    url: 'http://192.168.0.107:9501/Barrage/KuaiShouBarrage/getBarrage',
    method: 'post',
    params:{offset_time}
  })
}