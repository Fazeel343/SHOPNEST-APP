async function loadProducts(filters = {}) {
  const { category = '', search = '' } = filters;
  const url = `/products?search=${search}&category=${category}`;
  const products = await api.get(url);
  return products;
}

function renderProductCard(p) {
  return `
    <a href="product.html?id=${p.PRODUCT_ID}" 
       style="text-decoration:none;color:inherit">
      <div class="card product-card">
        <img src="${p.IMAGE_URL || 'https://placehold.co/400x200?text=No+Image'}"
             alt="${p.NAME}" loading="lazy">
        <div class="info">
          <div class="name">${p.NAME}</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:6px">
            ${p.CATEGORY || 'Uncategorized'}
          </div>
          <div class="stars">
            ${'★'.repeat(Math.round(p.AVG_RATING || 0))}
            ${'☆'.repeat(5 - Math.round(p.AVG_RATING || 0))}
          </div>
          <div class="price">Rs. ${Number(p.PRICE).toLocaleString()}</div>
          <button class="btn btn-primary" style="width:100%"
                  onclick="event.preventDefault();addToCart(${p.PRODUCT_ID})">
            Add to Cart
          </button>
        </div>
      </div>
    </a>`;
}

async function addToCart(pid) {
  if (!getToken()) return location.href = '/login.html';
  try {
    await api.post('/cart', { product_id: pid, quantity: 1 });
    alert('Added to cart!');
  } catch(e) {
    alert(e.message);
  }
}