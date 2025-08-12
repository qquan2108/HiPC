import axios from 'axios';

const GHN_BASE_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api';
const GHN_TOKEN = '08749195-4da3-11f0-bf1c-e283f3defbd9';
const GHN_SHOP_ID = '196957';

const ghn = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Token: GHN_TOKEN,
    ShopId: GHN_SHOP_ID,
  },
});

export const getProvinces = async () => {
  const res = await ghn.get('/master-data/province');
  return res.data.data || [];
};

export const getDistricts = async (provinceId) => {
  const res = await ghn.post('/master-data/district', { province_id: Number(provinceId) });
  return res.data.data || [];
};

export const getWards = async (districtId) => {
  const res = await ghn.post('/master-data/ward', { district_id: Number(districtId) });
  return res.data.data || [];
};

export default {
  getProvinces,
  getDistricts,
  getWards,
};