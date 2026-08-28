const api = (() => {
  const baseUrl = window.STAYNEAR_API_BASE || '/api';

  async function request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = sessionStorage.getItem('staynear_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error?.message || 'Request failed');
    }
    return payload.data ?? payload;
  }

  function normalizeProperty(property) {
    return {
      ...property,
      id: property.id || property._id,
      price: property.price ?? property.pricing?.monthlyRent,
      deposit: property.deposit ?? property.pricing?.securityDeposit,
      rating: property.rating?.average ?? property.rating ?? 0,
      facilities: property.facilities ?? property.amenities ?? [],
      image: property.image ?? property.images?.[0] ?? '',
      thumbnails: property.thumbnails ?? property.images ?? [],
      location: typeof property.location === 'string' ? property.location : [property.location?.area, property.location?.city].filter(Boolean).join(', '),
      distance: property.distance ?? '',
      occupancy: property.occupancy ?? property.rooms?.occupancy,
      availableRooms: property.availableRooms ?? property.rooms?.availableRooms,
      ownerPhone: property.ownerPhone ?? property.owner?.profile?.phone
    };
  }

  return {
    auth: {
      async signup(body) { const result = await request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }); sessionStorage.setItem('staynear_token', result.token); return result; },
      async login(body) { const result = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) }); sessionStorage.setItem('staynear_token', result.token); return result; },
      async logout() { try { await request('/auth/logout', { method: 'POST' }); } finally { sessionStorage.removeItem('staynear_token'); } },
      me() { return request('/auth/me'); }
    },
    user: {
      getProfile() { return request('/users/me'); },
      updateProfile(body) { return request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }); },
      updatePreferences(body) { return request('/users/me/preferences', { method: 'PATCH', body: JSON.stringify(body) }); }
    },
    properties: {
      async list(params = {}) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')); const result = await request(`/properties?${query}`); return { ...result, properties: (result.items || result.properties || []).map(normalizeProperty) }; },
      async getById(id) { const result = await request(`/properties/${encodeURIComponent(id)}`); return { ...result, property: normalizeProperty(result.property || result) }; }
    },
    favorites: {
      async list() { const result = await request('/favorites'); return { ...result, items: (result.items || []).map(item => ({ ...item, property: normalizeProperty(item.propertyId) })) }; },
      add(id) { return request(`/favorites/${encodeURIComponent(id)}`, { method: 'POST' }); },
      remove(id) { return request(`/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
    },
    owner: {
      createProperty(body) { return request('/owner/properties', { method: 'POST', body: JSON.stringify(body) }); },
      listProperties() { return request('/owner/properties'); }
    }
  };
})();
