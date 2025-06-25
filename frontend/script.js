const API_BASE = 'http://localhost:5130/api';
let currentUser = null;

// UI Elements
const navLogin = document.getElementById('nav-login');
const navRegister = document.getElementById('nav-register');
const navLogout = document.getElementById('nav-logout');
const navHistory = document.getElementById('nav-history');
const navRevenue = document.getElementById('nav-revenue');
const navCart = document.getElementById('nav-cart');
const bookListSection = document.getElementById('book-list-section');
const bookDetailSection = document.getElementById('book-detail-section');
const historySection = document.getElementById('history-section');
const revenueSection = document.getElementById('revenue-section');
const bookListDiv = document.getElementById('book-list');
const bookDetailDiv = document.getElementById('book-detail');
const historyListDiv = document.getElementById('history-list');
const revenueValueDiv = document.getElementById('revenue-value');
const backToListBtn = document.getElementById('back-to-list');

// Modal
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeLogin = document.getElementById('close-login');
const closeRegister = document.getElementById('close-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Checkout modal logic
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModal = document.getElementById('close-checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const checkoutError = document.getElementById('checkout-error');
const checkoutBookInfo = document.getElementById('checkout-book-info');
const checkoutTotal = document.getElementById('checkout-total');
let currentCheckoutBook = null;

// Cart modal logic
const cartModal = document.getElementById('cart-modal');
const closeCartModal = document.getElementById('close-cart-modal');
const cartListDiv = document.getElementById('cart-list');
const cartTotalDiv = document.getElementById('cart-total');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
const cartError = document.getElementById('cart-error');

// Navbar events
navLogin.onclick = () => showModal(loginModal);
navRegister.onclick = () => showModal(registerModal);
navLogout.onclick = () => { logout(); };
document.getElementById('nav-books').onclick = () => { showSection('books'); };
navHistory.onclick = () => { showSection('history'); };
navRevenue.onclick = () => { showSection('revenue'); };
navCart.onclick = () => { showCart(); };

closeLogin.onclick = () => hideModal(loginModal);
closeRegister.onclick = () => hideModal(registerModal);
window.onclick = (e) => {
    if (e.target === loginModal) hideModal(loginModal);
    if (e.target === registerModal) hideModal(registerModal);
};

// Modal helpers
function showModal(modal) { modal.style.display = 'flex'; }
function hideModal(modal) { modal.style.display = 'none'; }

// Section helpers
function showSection(section) {
    bookListSection.style.display = section === 'books' ? '' : 'none';
    bookDetailSection.style.display = 'none';
    historySection.style.display = section === 'history' ? '' : 'none';
    revenueSection.style.display = section === 'revenue' ? '' : 'none';
    if (section === 'books') loadBooks();
    if (section === 'history') loadHistory();
    if (section === 'revenue') loadRevenue();
}

// Auth
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        currentUser = data;
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateNav();
        hideModal(loginModal);
        showSection('books');
    } catch (err) {
        loginError.textContent = err.message || 'Đăng nhập thất bại';
    }
};

registerForm.onsubmit = async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error(await res.text());
        registerError.textContent = 'Đăng ký thành công! Hãy đăng nhập.';
    } catch (err) {
        registerError.textContent = err.message || 'Đăng ký thất bại';
    }
};

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    updateNav();
    showSection('books');
}

function updateNav() {
    if (currentUser) {
        navLogin.style.display = 'none';
        navRegister.style.display = 'none';
        navLogout.style.display = '';
        navHistory.style.display = '';
        navRevenue.style.display = currentUser.role === 'admin' ? '' : 'none';
        navCart.style.display = currentUser.role === 'user' ? '' : 'none';
    } else {
        navLogin.style.display = '';
        navRegister.style.display = '';
        navLogout.style.display = 'none';
        navHistory.style.display = 'none';
        navRevenue.style.display = 'none';
        navCart.style.display = 'none';
    }
}

// Thêm nút Thêm sách cho admin
function renderAddBookButton() {
    if (currentUser && currentUser.role === 'admin') {
        if (!document.getElementById('add-book-btn')) {
            const btn = document.createElement('button');
            btn.id = 'add-book-btn';
            btn.textContent = '+ Thêm sách';
            btn.style = 'margin-bottom:1rem;background:#1976d2;color:#fff;border:none;border-radius:4px;padding:0.5rem 1rem;cursor:pointer;';
            btn.onclick = () => openBookModal();
            bookListSection.insertBefore(btn, bookListDiv);
        }
    } else {
        const btn = document.getElementById('add-book-btn');
        if (btn) btn.remove();
    }
}

// Sửa lại loadBooks để render nút Thêm sách cho admin
async function loadBooks() {
    renderAddBookButton();
    bookListDiv.innerHTML = '<div>Đang tải...</div>';
    try {
        const res = await fetch(`${API_BASE}/book`);
        const books = await res.json();
        bookListDiv.innerHTML = books.map(book => `
            <div class="book-card">
                <img src="${book.image || 'https://via.placeholder.com/100x140?text=No+Image'}" alt="${book.title}">
                <h3>${book.title}</h3>
                <div class="author">${book.author}</div>
                <div class="price">${book.price.toLocaleString()} đ</div>
                <button onclick="showBookDetail('${book.id}')">Xem chi tiết</button>
            </div>
        `).join('');
    } catch {
        bookListDiv.innerHTML = '<div>Lỗi tải sách.</div>';
    }
}

// Hiển thị chi tiết sách hoặc form admin
window.showBookDetail = async function(id) {
    bookListSection.style.display = 'none';
    bookDetailSection.style.display = '';
    bookDetailDiv.innerHTML = '<div>Đang tải...</div>';
    try {
        const res = await fetch(`${API_BASE}/book/${id}`);
        if (!res.ok) throw new Error('Không tìm thấy sách');
        const book = await res.json();
        if (currentUser && currentUser.role === 'admin') {
            bookDetailDiv.innerHTML = `
                <div class="admin-heading">🛠 Chế độ Quản trị viên: Thêm/Sửa sách</div>
                <button onclick="openBookModal('${book.id}')">Sửa sách</button>
                <button onclick="deleteBook('${book.id}')" style="margin-left:1rem;background:#d32f2f;">Xóa sách</button>
            `;
        } else {
            bookDetailDiv.innerHTML = `
                <div class="user-heading">📚 Chi tiết sách</div>
                <img src="${book.image || 'https://via.placeholder.com/120x170?text=No+Image'}" alt="${book.title}">
                <h2>${book.title}</h2>
                <div class="author">${book.author}</div>
                <div class="price">${book.price.toLocaleString()} đ</div>
                <div class="desc">${book.description}</div>
                <div style="display:flex;gap:1rem;">
                    ${currentUser ? `<button onclick="buyBook('${book.id}')">Mua ngay</button>
                    <button onclick="addToCart('${book.id}')">Thêm vào giỏ</button>` : '<div>Hãy đăng nhập để mua sách.</div>'}
                </div>
            `;
        }
        window.currentBookEditing = book;
    } catch {
        bookDetailDiv.innerHTML = '<div>Lỗi tải chi tiết sách.</div>';
    }
};

// Mở modal thêm/sửa sách
function openBookModal(bookId) {
    const modal = document.getElementById('book-modal');
    const form = document.getElementById('book-form');
    const errorDiv = document.getElementById('book-form-error');
    const titleInput = document.getElementById('book-title');
    const authorInput = document.getElementById('book-author');
    const priceInput = document.getElementById('book-price');
    const descInput = document.getElementById('book-description');
    const imageFileInput = document.getElementById('book-image-file');
    const imageUrlInput = document.getElementById('book-image-url');
    const submitBtn = document.getElementById('book-form-submit');
    errorDiv.textContent = '';
    if (bookId && window.currentBookEditing) {
        // Sửa sách
        titleInput.value = window.currentBookEditing.title;
        authorInput.value = window.currentBookEditing.author;
        priceInput.value = window.currentBookEditing.price;
        descInput.value = window.currentBookEditing.description;
        imageFileInput.value = '';
        imageUrlInput.value = window.currentBookEditing.image || '';
        submitBtn.textContent = 'Cập nhật sách';
        form.onsubmit = async (e) => {
            e.preventDefault();
            errorDiv.textContent = '';
            let image = imageUrlInput.value;
            if (imageFileInput.files[0]) {
                image = await toBase64(imageFileInput.files[0]);
            }
            const book = {
                title: titleInput.value,
                author: authorInput.value,
                price: Number(priceInput.value),
                description: descInput.value,
                image
            };
            try {
                const res = await fetch(`${API_BASE}/book/${bookId}?userId=${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(book)
                });
                if (!res.ok) throw new Error(await res.text());
                hideModal(modal);
                showSection('books');
            } catch (err) {
                errorDiv.textContent = err.message || 'Lỗi cập nhật sách';
            }
        };
    } else {
        // Thêm sách
        titleInput.value = '';
        authorInput.value = '';
        priceInput.value = '';
        descInput.value = '';
        imageFileInput.value = '';
        imageUrlInput.value = '';
        submitBtn.textContent = 'Thêm sách';
        form.onsubmit = async (e) => {
            e.preventDefault();
            errorDiv.textContent = '';
            let image = imageUrlInput.value;
            if (imageFileInput.files[0]) {
                image = await toBase64(imageFileInput.files[0]);
            }
            const book = {
                title: titleInput.value,
                author: authorInput.value,
                price: Number(priceInput.value),
                description: descInput.value,
                image
            };
            try {
                const res = await fetch(`${API_BASE}/book?userId=${currentUser.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(book)
                });
                if (!res.ok) throw new Error(await res.text());
                hideModal(modal);
                showSection('books');
            } catch (err) {
                errorDiv.textContent = err.message || 'Lỗi thêm sách';
            }
        };
    }
    showModal(modal);
}

// Đóng modal thêm/sửa sách
const closeBookModal = document.getElementById('close-book-modal');
closeBookModal.onclick = () => hideModal(document.getElementById('book-modal'));

// Xóa sách
window.deleteBook = async function(bookId) {
    if (!confirm('Bạn có chắc muốn xóa sách này?')) return;
    try {
        const res = await fetch(`${API_BASE}/book/${bookId}?userId=${currentUser.id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Đã xóa sách!');
        showSection('books');
    } catch (err) {
        alert('Lỗi xóa sách: ' + (err.message || 'Không xác định'));
    }
};

// Chuyển file ảnh sang base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

backToListBtn.onclick = () => {
    bookDetailSection.style.display = 'none';
    bookListSection.style.display = '';
};

window.buyBook = async function(bookId) {
    if (!currentUser) {
        showModal(loginModal);
        return;
    }
    // Lấy thông tin sách
    try {
        const res = await fetch(`${API_BASE}/book/${bookId}`);
        if (!res.ok) throw new Error('Không tìm thấy sách');
        const book = await res.json();
        currentCheckoutBook = book;
        checkoutBookInfo.innerHTML = `
            <div><b>${book.title}</b> - <span style='color:#388e3c'>${book.price.toLocaleString()} đ</span></div>
        `;
        checkoutTotal.textContent = (book.price + 30000).toLocaleString() + ' đ';
        checkoutForm.reset();
        checkoutError.textContent = '';
        showModal(checkoutModal);
    } catch {
        alert('Lỗi tải thông tin sách.');
    }
};

checkoutForm.onsubmit = async (e) => {
    e.preventDefault();
    checkoutError.textContent = '';
    if (!currentCheckoutBook) return;
    // Lấy thông tin người nhận
    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    // Mock thanh toán: chỉ cần gọi API mua sách, lưu thêm thông tin vào localStorage/history nếu muốn
    try {
        const res = await fetch(`${API_BASE}/order/buy?userId=${currentUser.id}&bookId=${currentCheckoutBook.id}`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error(await res.text());
        // Có thể lưu thông tin người nhận vào localStorage/history nếu muốn
        hideModal(checkoutModal);
        alert('Thanh toán thành công! Đơn hàng sẽ được giao tới bạn.');
        showSection('history');
    } catch (err) {
        checkoutError.textContent = err.message || 'Lỗi thanh toán';
    }
};

// Lịch sử mua
async function loadHistory() {
    if (!currentUser) {
        historyListDiv.innerHTML = '<div>Hãy đăng nhập để xem lịch sử mua.</div>';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/order/history?userId=${currentUser.id}`);
        const orders = await res.json();
        if (!orders.length) {
            historyListDiv.innerHTML = '<div>Bạn chưa mua sách nào.</div>';
            return;
        }
        // Lấy thông tin sách cho từng order
        const bookMap = {};
        for (const order of orders) {
            if (!bookMap[order.bookId]) {
                const resBook = await fetch(`${API_BASE}/book/${order.bookId}`);
                bookMap[order.bookId] = resBook.ok ? await resBook.json() : { title: 'Không tìm thấy', price: 0 };
            }
        }
        historyListDiv.innerHTML = orders.map(order => {
            const book = bookMap[order.bookId];
            return `<div class="book-card" style="flex-direction:row;align-items:center;gap:1rem;">
                <img src="${book.image || 'https://via.placeholder.com/60x80?text=No+Image'}" alt="${book.title}" style="width:60px;height:80px;">
                <div>
                    <div><b>${book.title}</b></div>
                    <div class="price">${order.price.toLocaleString()} đ</div>
                    <div style="font-size:0.95em;color:#888;">${new Date(order.createdAt).toLocaleString()}</div>
                </div>
            </div>`;
        }).join('');
    } catch {
        historyListDiv.innerHTML = '<div>Lỗi tải lịch sử mua.</div>';
    }
}

// Doanh thu
async function loadRevenue() {
    if (!currentUser || currentUser.role !== 'admin') {
        revenueValueDiv.innerHTML = '<div>Bạn không có quyền xem doanh thu.</div>';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/order/revenue?userId=${currentUser.id}`);
        const data = await res.json();
        revenueValueDiv.innerHTML = `<div style="font-size:2rem;color:#388e3c;font-weight:bold;">${data.revenue.toLocaleString()} đ</div>`;
    } catch {
        revenueValueDiv.innerHTML = '<div>Lỗi tải doanh thu.</div>';
    }
}

window.addToCart = async function(bookId) {
    if (!currentUser) {
        showModal(loginModal);
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/cart/add?userId=${currentUser.id}&bookId=${bookId}&quantity=1`, { method: 'POST' });
        if (!res.ok) throw new Error(await res.text());
        alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
        alert('Lỗi thêm vào giỏ hàng: ' + (err.message || 'Không xác định'));
    }
};

async function showCart() {
    if (!currentUser) {
        showModal(loginModal);
        return;
    }
    cartError.textContent = '';
    cartListDiv.innerHTML = 'Đang tải...';
    try {
        const res = await fetch(`${API_BASE}/cart?userId=${currentUser.id}`);
        const cart = await res.json();
        if (!cart.length) {
            cartListDiv.innerHTML = '<div>Giỏ hàng trống.</div>';
            cartTotalDiv.textContent = '';
            cartCheckoutBtn.style.display = 'none';
            showModal(cartModal);
            return;
        }
        // Lấy thông tin sách cho từng item
        const bookMap = {};
        for (const item of cart) {
            if (!bookMap[item.bookId]) {
                const resBook = await fetch(`${API_BASE}/book/${item.bookId}`);
                bookMap[item.bookId] = resBook.ok ? await resBook.json() : { title: 'Không tìm thấy', price: 0, image: '' };
            }
        }
        let total = 0;
        cartListDiv.innerHTML = cart.map(item => {
            const book = bookMap[item.bookId];
            total += book.price * item.quantity;
            return `<div class="cart-item">
                <img src="${book.image || 'https://via.placeholder.com/60x80?text=No+Image'}" alt="${book.title}">
                <div style="flex:1;">
                    <div class="cart-title">${book.title}</div>
                    <div>Tác giả: ${book.author || ''}</div>
                    <div>Giá: <span class="price">${book.price.toLocaleString()} đ</span></div>
                </div>
                <input type="number" min="1" class="cart-qty" value="${item.quantity}" onchange="updateCartQty('${item.bookId}', this.value)">
                <button onclick="removeFromCart('${item.bookId}')">X</button>
            </div>`;
        }).join('');
        cartTotalDiv.textContent = 'Tổng tiền: ' + total.toLocaleString() + ' đ';
        cartCheckoutBtn.style.display = '';
        showModal(cartModal);
    } catch {
        cartListDiv.innerHTML = '<div>Lỗi tải giỏ hàng.</div>';
        cartTotalDiv.textContent = '';
        cartCheckoutBtn.style.display = 'none';
        showModal(cartModal);
    }
}

window.updateCartQty = async function(bookId, qty) {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE}/cart/update?userId=${currentUser.id}&bookId=${bookId}&quantity=${qty}`, { method: 'PUT' });
        if (!res.ok) throw new Error(await res.text());
        showCart();
    } catch (err) {
        alert('Lỗi cập nhật số lượng: ' + (err.message || 'Không xác định'));
    }
};

window.removeFromCart = async function(bookId) {
    if (!currentUser) return;
    try {
        const res = await fetch(`${API_BASE}/cart/remove?userId=${currentUser.id}&bookId=${bookId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        showCart();
    } catch (err) {
        alert('Lỗi xóa sản phẩm: ' + (err.message || 'Không xác định'));
    }
};

cartCheckoutBtn.onclick = async function() {
    if (!currentUser) return;
    cartError.textContent = '';
    try {
        const res = await fetch(`${API_BASE}/cart/checkout?userId=${currentUser.id}`, { method: 'POST' });
        if (!res.ok) throw new Error(await res.text());
        alert('Thanh toán giỏ hàng thành công!');
        hideModal(cartModal);
        showSection('history');
    } catch (err) {
        cartError.textContent = err.message || 'Lỗi thanh toán giỏ hàng';
    }
};

// Khởi tạo
function init() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try { currentUser = JSON.parse(userStr); } catch {}
    }
    updateNav();
    showSection('books');
}

init();

closeCheckoutModal.onclick = () => hideModal(checkoutModal);
closeCartModal.onclick = () => hideModal(cartModal); 