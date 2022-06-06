import axios from "axios";

export function getBarrage(offset_time) {
  return axios.request({
    url: 'http://192.168.18.56:9503/Barrage/KuaiShouBarrage/getBarrage',
    method: 'post',
    params:{offset_time}
  })
}