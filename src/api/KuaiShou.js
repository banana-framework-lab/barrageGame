import axios from "axios";

export function getBarrage() {
  axios.request({
    url: '/ADAnalysis/reportPermission',
    method: 'post'
  })
}