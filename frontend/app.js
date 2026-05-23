let dishes = [];
const cart = new Map();
let activeCategory = "All";
let profile = JSON.parse(localStorage.getItem("biterushProfile") || "null");
let pendingAuthPhoto = "";
let buyNowDish = null;

const rupee = (value) => `₹${value.toLocaleString("en-IN")}`;
const menuGrid = document.getElementById("menuGrid");
const categories = document.getElementById("categories");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const itemLabel = document.getElementById("itemLabel");
const subtotal = document.getElementById("subtotal");
const delivery = document.getElementById("delivery");
const total = document.getElementById("total");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");
const dishCount = document.getElementById("dishCount");
const ordersList = document.getElementById("ordersList");
const ordersModal = document.getElementById("ordersModal");
const _accountPanel = document.getElementById("accountPanel");
const accountModal = document.getElementById("accountModal");
const accountLabel = document.getElementById("accountLabel");
const accountStatus = document.getElementById("accountStatus");
const navAvatar = document.getElementById("navAvatar");
const profilePhoto = document.getElementById("profilePhoto");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const loginName = document.getElementById("loginName");
const loginPhone = document.getElementById("loginPhone");
const loginEmail = document.getElementById("loginEmail");
const profileName = document.getElementById("profileName");
const profilePhone = document.getElementById("profilePhone");
const profileEmail = document.getElementById("profileEmail");
const myOrdersList = document.getElementById("myOrdersList");
const authGate = document.getElementById("authGate");
const authForm = document.getElementById("authForm");
const authName = document.getElementById("authName");
const authPhone = document.getElementById("authPhone");
const authEmail = document.getElementById("authEmail");
const authPhotoInput = document.getElementById("authPhotoInput");
const authPhotoPreview = document.getElementById("authPhotoPreview");
const buyModal = document.getElementById("buyModal");
const cartModal = document.getElementById("cartModal");
const buySummary = document.getElementById("buySummary");
const buyName = document.getElementById("buyName");
const buyPhone = document.getElementById("buyPhone");
const buyAddress = document.getElementById("buyAddress");
const buyNote = document.getElementById("buyNote");

async function api(path, options = {}) {
	const response = await fetch(path, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || "Request failed");
	return data;
}

function saveProfile(nextProfile) {
	profile = nextProfile;
	localStorage.setItem("biterushProfile", JSON.stringify(profile));
	renderProfile();
}

function getInitial(name) {
	return (name || "Account").trim().charAt(0).toUpperCase();
}

function setPhoto(target, name) {
	target.textContent = "";
	target.style.backgroundImage = "";

	if (profile?.photo) {
		target.style.backgroundImage = `url("${profile.photo}")`;
		return;
	}

	target.textContent = getInitial(name);
}

function setPreviewPhoto(target, photo, name) {
	target.textContent = "";
	target.style.backgroundImage = "";

	if (photo) {
		target.style.backgroundImage = `url("${photo}")`;
		return;
	}

	target.textContent = getInitial(name);
}

function updateDashboardAccess() {
	const isLoggedIn = Boolean(profile?.name && profile?.phone);
	document.body.classList.toggle("auth-locked", !isLoggedIn);
	document.body.classList.toggle("auth-ready", isLoggedIn);
}

function renderProfile() {
	const name = profile?.name || "";
	const phone = profile?.phone || "";
	const email = profile?.email || "";

	accountLabel.textContent = name ? "My Account" : "Login";
	accountStatus.textContent = name
		? "Profile saved"
		: "Login to save your profile";
	loginName.value = name;
	loginPhone.value = phone;
	loginEmail.value = email;
	profileName.textContent = name || "Guest";
	profilePhone.textContent = phone || "Not added";
	profileEmail.textContent = email || "Not added";
	document.getElementById("customerName").value = name;
	document.getElementById("customerPhone").value = phone;
	setPhoto(profilePhoto, name);
	setPhoto(navAvatar, name);
	updateDashboardAccess();
}

function handleLogin(event) {
	event.preventDefault();
	saveProfile({
		name: loginName.value.trim(),
		phone: loginPhone.value.trim(),
		email: loginEmail.value.trim(),
		photo: profile?.photo || "",
	});
	showToast("Profile saved");
	loadMyOrders();
}

function handleAuthLogin(event) {
	event.preventDefault();
	saveProfile({
		name: authName.value.trim(),
		phone: authPhone.value.trim(),
		email: authEmail.value.trim(),
		photo: pendingAuthPhoto,
	});
	authForm.reset();
	pendingAuthPhoto = "";
	setPreviewPhoto(authPhotoPreview, "", "");
	showToast("Welcome to your dashboard");
	loadMenu();
	loadOrders(false);
	loadMyOrders();
}

function logout() {
	profile = null;
	localStorage.removeItem("biterushProfile");
	closeAccount();
	renderProfile();
	renderMyOrders([]);
	authGate.scrollIntoView({ behavior: "smooth", block: "start" });
	showToast("Logged out");
}

function openAccount() {
	accountModal.classList.add("show");
	accountModal.setAttribute("aria-hidden", "false");
	loadMyOrders();
}

function closeAccount() {
	accountModal.classList.remove("show");
	accountModal.setAttribute("aria-hidden", "true");
}

function openCart() {
	cartModal.classList.add("show");
	cartModal.setAttribute("aria-hidden", "false");
}

function closeCart() {
	cartModal.classList.remove("show");
	cartModal.setAttribute("aria-hidden", "true");
}

async function openOrders() {
	ordersModal.classList.add("show");
	ordersModal.setAttribute("aria-hidden", "false");
	await loadOrders();
}

function closeOrders() {
	ordersModal.classList.remove("show");
	ordersModal.setAttribute("aria-hidden", "true");
}

function updateProfilePhoto(file) {
	if (!file) return;
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		saveProfile({
			name: loginName.value.trim() || profile?.name || "Account",
			phone: loginPhone.value.trim() || profile?.phone || "",
			email: loginEmail.value.trim() || profile?.email || "",
			photo: reader.result,
		});
		showToast("Profile photo added");
	});
	reader.readAsDataURL(file);
}

function updateAuthPhoto(file) {
	if (!file) return;
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		pendingAuthPhoto = reader.result;
		setPreviewPhoto(authPhotoPreview, pendingAuthPhoto, authName.value);
	});
	reader.readAsDataURL(file);
}

async function loadMenu() {
	try {
		const data = await api("/api/menu");
		dishes = data.menu;
		dishCount.textContent = dishes.length;
		renderCategories();
		renderMenu();
	} catch (error) {
		menuGrid.innerHTML = `<p class="empty">${error.message}</p>`;
	}
}

function renderCategories() {
	const names = ["All", ...new Set(dishes.map((dish) => dish.category))];
	categories.innerHTML = names
		.map(
			(name) =>
				`<button class="category ${name === activeCategory ? "active" : ""}" data-category="${name}">${name}</button>`,
		)
		.join("");

	document.querySelectorAll(".category").forEach((button) => {
		button.addEventListener("click", () => {
			activeCategory = button.dataset.category;
			renderCategories();
			renderMenu();
		});
	});
}

function renderMenu() {
	const query = searchInput.value.trim().toLowerCase();
	const filtered = dishes.filter((dish) => {
		const matchesCategory =
			activeCategory === "All" || dish.category === activeCategory;
		const matchesSearch =
			!query ||
			`${dish.name} ${dish.category} ${dish.desc}`
				.toLowerCase()
				.includes(query);
		return matchesCategory && matchesSearch;
	});

	menuGrid.innerHTML =
		filtered
			.map(
				(dish) => `
    <article class="dish">
      <img src="${dish.image}" alt="${dish.name}">
      <div class="dish-body">
        <div class="dish-top">
          <h3>${dish.name}</h3>
          <span class="price">${rupee(dish.price)}</span>
        </div>
        <p>${dish.desc}</p>
        <div class="dish-meta">
          <span class="rating-badge">&#9733; ${dish.rating}</span>
          <span>${dish.time}</span>
        </div>
        <div class="offer-line">Bank offer available</div>
        <div class="dish-actions">
          <button class="add" data-id="${dish.id}">Add to cart</button>
          <button class="buy-now" data-id="${dish.id}">Buy now</button>
        </div>
      </div>
    </article>
  `,
			)
			.join("") || `<p class="empty">No dishes found. Try another search.</p>`;

	document.querySelectorAll(".add").forEach((button) => {
		button.addEventListener("click", () =>
			addToCart(Number(button.dataset.id)),
		);
	});
	document.querySelectorAll(".buy-now").forEach((button) => {
		button.addEventListener("click", () =>
			openBuyNow(Number(button.dataset.id)),
		);
	});
}

function addToCart(id) {
	const dish = dishes.find((item) => item.id === id);
	const current = cart.get(id) || { dish, qty: 0 };
	current.qty += 1;
	cart.set(id, current);
	showToast(`${dish.name} added`);
	renderCart();
}

function openBuyNow(id) {
	buyNowDish = dishes.find((item) => item.id === id);
	if (!buyNowDish) return;

	buyName.value =
		profile?.name || document.getElementById("customerName").value || "";
	buyPhone.value =
		profile?.phone || document.getElementById("customerPhone").value || "";
	buyAddress.value = document.getElementById("customerAddress").value || "";
	buyNote.value = "";
	buySummary.innerHTML = `
    <img src="${buyNowDish.image}" alt="${buyNowDish.name}">
    <div>
      <span>Buy now</span>
      <strong>${buyNowDish.name}</strong>
      <p>${rupee(buyNowDish.price)} - ${buyNowDish.time}</p>
    </div>
  `;
	buyModal.classList.add("show");
	buyModal.setAttribute("aria-hidden", "false");
	buyAddress.focus();
}

function closeBuyNow() {
	buyModal.classList.remove("show");
	buyModal.setAttribute("aria-hidden", "true");
	buyNowDish = null;
}

async function placeBuyNow(event) {
	event.preventDefault();
	if (!buyNowDish) return;

	const addressParts = [buyAddress.value.trim(), buyNote.value.trim()].filter(
		Boolean,
	);
	const payload = {
		customer: {
			name: buyName.value.trim(),
			phone: buyPhone.value.trim(),
			address: addressParts.join(" - "),
		},
		items: [{ id: buyNowDish.id, qty: 1 }],
	};

	try {
		const data = await api("/api/orders", {
			method: "POST",
			body: JSON.stringify(payload),
		});
		document.getElementById("customerName").value = payload.customer.name;
		document.getElementById("customerPhone").value = payload.customer.phone;
		document.getElementById("customerAddress").value = buyAddress.value.trim();
		event.target.reset();
		closeBuyNow();
		showToast(`Order ${data.order.id} placed`);
		await loadOrders(false);
		await loadMyOrders();
	} catch (error) {
		showToast(error.message);
	}
}

function changeQty(id, delta) {
	const item = cart.get(id);
	if (!item) return;
	item.qty += delta;
	if (item.qty <= 0) cart.delete(id);
	renderCart();
}

function renderCart() {
	const items = [...cart.values()];
	const count = items.reduce((sum, item) => sum + item.qty, 0);
	const sub = items.reduce((sum, item) => sum + item.dish.price * item.qty, 0);
	const fee = sub === 0 || sub >= 799 ? 0 : 49;

	cartCount.textContent = count;
	itemLabel.textContent = `${count} ${count === 1 ? "item" : "items"}`;
	subtotal.textContent = rupee(sub);
	delivery.textContent = fee === 0 ? "Free" : rupee(fee);
	total.textContent = rupee(sub + fee);

	cartItems.innerHTML = items.length
		? items
				.map(
					(item) => `
    <div class="cart-item">
      <div>
        <strong>${item.dish.name}</strong>
        <span>${rupee(item.dish.price)} each</span>
      </div>
      <div class="qty">
        <button data-id="${item.dish.id}" data-delta="-1">−</button>
        <strong>${item.qty}</strong>
        <button data-id="${item.dish.id}" data-delta="1">+</button>
      </div>
    </div>
  `,
				)
				.join("")
		: `<div class="empty">Your cart is waiting. Add something delicious from the menu.</div>`;

	document.querySelectorAll(".qty button").forEach((button) => {
		button.addEventListener("click", () =>
			changeQty(Number(button.dataset.id), Number(button.dataset.delta)),
		);
	});
}

async function placeOrder(event) {
	event.preventDefault();

	if (cart.size === 0) {
		showToast("Add an item before checkout");
		return;
	}

	const payload = {
		customer: {
			name: document.getElementById("customerName").value,
			phone: document.getElementById("customerPhone").value,
			address: document.getElementById("customerAddress").value,
		},
		items: [...cart.values()].map((item) => ({
			id: item.dish.id,
			qty: item.qty,
		})),
	};

	try {
		const data = await api("/api/orders", {
			method: "POST",
			body: JSON.stringify(payload),
		});
		cart.clear();
		renderCart();
		event.target.reset();
		showToast(`Order ${data.order.id} placed`);
		await loadOrders();
		await loadMyOrders();
	} catch (error) {
		showToast(error.message);
	}
}

function renderOrderCards(orders, emptyMessage) {
	return orders.length
		? orders
				.map(
					(order) => `
    <article class="order-card">
      <strong><span>${order.id}</span><span>${rupee(order.total)}</span></strong>
      <span>${order.customer.name} - ${order.items.length} item type(s) - ${new Date(order.createdAt).toLocaleString()}</span>
    </article>
  `,
				)
				.join("")
		: `<p class="empty">${emptyMessage}</p>`;
}

function renderMyOrders(orders) {
	myOrdersList.innerHTML = renderOrderCards(
		orders,
		profile
			? "No orders found for this account yet."
			: "Login to see your account orders.",
	);
}

async function loadMyOrders() {
	if (!profile?.name && !profile?.phone) {
		renderMyOrders([]);
		return;
	}

	try {
		const data = await api("/api/orders");
		const profileNameKey = (profile.name || "").trim().toLowerCase();
		const profilePhoneKey = (profile.phone || "").trim();
		const orders = data.orders.filter((order) => {
			const orderNameKey = (order.customer.name || "").trim().toLowerCase();
			const orderPhoneKey = (order.customer.phone || "").trim();
			return (
				(profilePhoneKey && orderPhoneKey === profilePhoneKey) ||
				(profileNameKey && orderNameKey === profileNameKey)
			);
		});
		renderMyOrders(orders);
	} catch (error) {
		myOrdersList.innerHTML = `<p class="empty">${error.message}</p>`;
	}
}

async function loadOrders() {
	try {
		const data = await api("/api/orders");
		const orders = data.orders;
		ordersList.innerHTML = renderOrderCards(
			orders,
			"No orders yet. Place the first one from the cart.",
		);
	} catch (error) {
		ordersList.innerHTML = `<p class="empty">${error.message}</p>`;
	}
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add("show");
	setTimeout(() => toast.classList.remove("show"), 1600);
}

document.getElementById("browseMenu").addEventListener("click", () => {
	document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("cartButton").addEventListener("click", () => {
	openCart();
});

document.getElementById("accountButton").addEventListener("click", () => {
	openAccount();
});

document.getElementById("openAccount").addEventListener("click", () => {
	openAccount();
});

document.getElementById("loadOrders").addEventListener("click", openOrders);
document.getElementById("ordersButton").addEventListener("click", openOrders);
document.getElementById("refreshOrders").addEventListener("click", loadOrders);
document
	.getElementById("refreshMyOrders")
	.addEventListener("click", loadMyOrders);
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("logoutButton").addEventListener("click", logout);
document
	.getElementById("closeAccountModal")
	.addEventListener("click", closeAccount);
accountModal.addEventListener("click", (event) => {
	if (event.target === accountModal) closeAccount();
});
document.getElementById("closeCartModal").addEventListener("click", closeCart);
cartModal.addEventListener("click", (event) => {
	if (event.target === cartModal) closeCart();
});
document
	.getElementById("closeOrdersModal")
	.addEventListener("click", closeOrders);
ordersModal.addEventListener("click", (event) => {
	if (event.target === ordersModal) closeOrders();
});
profilePhotoInput.addEventListener("change", () =>
	updateProfilePhoto(profilePhotoInput.files[0]),
);
authForm.addEventListener("submit", handleAuthLogin);
authPhotoInput.addEventListener("change", () =>
	updateAuthPhoto(authPhotoInput.files[0]),
);
authName.addEventListener("input", () =>
	setPreviewPhoto(authPhotoPreview, pendingAuthPhoto, authName.value),
);
document.getElementById("clearCart").addEventListener("click", () => {
	cart.clear();
	renderCart();
	showToast("Cart cleared");
});

document.getElementById("orderForm").addEventListener("submit", placeOrder);
document.getElementById("buyForm").addEventListener("submit", placeBuyNow);
document.getElementById("closeBuyModal").addEventListener("click", closeBuyNow);
buyModal.addEventListener("click", (event) => {
	if (event.target === buyModal) closeBuyNow();
});
searchInput.addEventListener("input", renderMenu);
document.querySelectorAll(".service-strip button").forEach((button) => {
	button.addEventListener("click", () => {
		if (!button.dataset.target) return;
		document
			.getElementById(button.dataset.target)
			.scrollIntoView({ behavior: "smooth", block: "start" });
	});
});

renderProfile();
renderCart();
if (profile?.name && profile?.phone) {
	loadMenu();
	loadOrders(false);
	loadMyOrders();
}
