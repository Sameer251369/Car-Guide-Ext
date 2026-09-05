import axios from 'axios';

const RENDER_ORIGIN = 'https://car-guide-engine.onrender.com';

const stripSlash = (value) => String(value || '').replace(/\/+$/, '');

/**
 * Default: same-origin `/api/v1` (Vite proxy locally, Vercel rewrites in production).
 * Set VITE_API_URL only to call Django directly from the browser (requires CORS).
 */
const getApiOrigin = () => {
  const configured = stripSlash(import.meta.env.VITE_API_URL || '');
  if (configured) return configured;

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host.endsWith('vercel.app') || host.includes('localhost') || host.includes('127.0.0.1')) {
    return host.includes('localhost') || host.includes('127.0.0.1') ? '' : RENDER_ORIGIN;
  }

  return '';
};

const API_ORIGIN = getApiOrigin();
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api/v1` : '/api/v1';

/** Django often returns absolute media URLs on Render; serve them via the same-origin rewrite. */
export const toAppMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/media/')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.origin === RENDER_ORIGIN && parsed.pathname.startsWith('/media/')) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return url;
  }
  return url;
};

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
    const res = await client.post('/admin/vehicles/', payload);
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
