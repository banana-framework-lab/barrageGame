import axios from "axios";

export function getBarrage() {k
  axios.request({
    url: '/ADAnalysis/reportPermission',
    method: 'post'
  })
}