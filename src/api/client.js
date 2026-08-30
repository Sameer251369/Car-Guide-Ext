import axios from 'axios';

const RENDER_ORIGIN = 'https://car-guide-engine.onrender.com';

const stripSlash = (value) => String(value || '').replace(/\/+$/, '');

/**
 * Local `npm run dev`: same-origin `/api/v1` via Vite proxy (local Django by default).
 * Production build: Render API unless VITE_API_URL is overridden at build time.
 */
const envOrigin = stripSlash(import.meta.env.VITE_API_URL);
const API_ORIGIN = envOrigin || (import.meta.env.DEV ? '' : RENDER_ORIGIN);
const API_BASE = `${API_ORIGIN}/api/v1`;

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let csrfTokenMemory = null;
let csrfWarm = null;

const resolveCsrfToken = async () => {
  const fromCookie = getCookie('csrftoken');
  if (fromCookie) {
    csrfTokenMemory = fromCookie;
    return fromCookie;
  }
  if (csrfTokenMemory) {
    return csrfTokenMemory;
  }
  if (!csrfWarm) {
    csrfWarm = axios
      .get(`${API_BASE}/auth/csrf/`, { withCredentials: true })
      .then((res) => {
        csrfTokenMemory = res.data?.csrfToken || getCookie('csrftoken');
        return csrfTokenMemory;
      })
      .catch(() => null);
  }
  return csrfWarm;
};

client.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrfToken = await resolveCsrfToken();
    if (csrfToken) {
      config.headers = {
        ...config.headers,
        'X-CSRFToken': csrfToken,
      };
    }
  }
  return config;
});

export const api = {
  adminLogin: async (payload) => {
    const res = await client.post('/auth/login/', payload);
    return res.data;
  },

  adminLogout: async () => {
    const res = await client.post('/auth/logout/');
    return res.data;
  },

  getAdminSession: async () => {
    const res = await client.get('/auth/me/');
    return res.data;
  },
  // Portfolio
  getBrands: async () => {
    const res = await client.get('/brands/');
    return res.data;
  },

  getVehicles: async (params = {}) => {
    const res = await client.get('/vehicles/', { params });
    return res.data;
  },

  getVehicleFacets: async () => {
    const res = await client.get('/vehicles/facets/');
    return res.data;
  },

  getVehicleBySlug: async (slug) => {
    const res = await client.get(`/vehicles/${slug}/`);
    return res.data;
  },

  // Admin
  getNeedsReviewVehicles: async (params = {}) => {
    const res = await client.get('/admin/vehicles/needs-review/', { params });
    return res.data;
  },

  getAdminLeads: async (params = {}) => {
    const res = await client.get('/admin/leads/', { params });
    return res.data;
  },

  createAdminVehicle: async (payload) => {
    const res = await client.post('/admin/vehicles/', payload, {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  exportLeadsCsv: async (params = {}) => {
    const res = await client.get('/admin/leads/export/', {
      params,
      responseType: 'blob',
    });
    return res.data;
  },

  markLeadsExported: async (leadIds) => {
    const res = await client.post('/admin/leads/mark_exported/', { lead_ids: leadIds });
    return res.data;
  },

  // Blog
  getBlogCategories: async () => {
    const res = await client.get('/blog/categories/');
    return res.data;
  },

  getArticles: async (params = {}) => {
    const res = await client.get('/blog/articles/', { params });
    return res.data;
  },

  getArticleBySlug: async (slug) => {
    const res = await client.get(`/blog/articles/${slug}/`);
    return res.data;
  },

  // Calculator
  getStates: async () => {
    const res = await client.get('/calculator/states/');
    return res.data;
  },

  getEstimate: async (payload) => {
    const res = await client.post('/calculator/estimate/', payload);
    return res.data;
  },

  submitLeadAndGetBreakdown: async (payload) => {
    const res = await client.post('/calculator/lead/', payload);
    return res.data;
  },
};

export default api;
