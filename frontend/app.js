let dishes = [];
const cart = new Map();
let activeCategory = "All";
let profile = JSON.parse(localStorage.getItem("biterushProfile") || "null");
let pendingAuthPhoto = "";
let buyNowDish = null;
let toastTimeout;

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
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const customerAddress = document.getElementById("customerAddress");

async function api(path, options = {}) {
	const response = await fetch(path, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	const data = await response.json();
	if (!response.ok) throw new Error(data.error || "Request failed");
	return data;
}

function showToast(message) {
	if (!toast) return;

	toast.textContent = message;
	toast.classList.add("show");
	window.clearTimeout(toastTimeout);
	toastTimeout = window.setTimeout(() => {
		toast.classList.remove("show");
	}, 2400);
}

function setText(element, value) {
	if (element) {
		element.textContent = value;
	}
}

function setValue(element, value) {
	if (element) {
		element.value = value;
	}
}

function getValue(element) {
	return element?.value || "";
}

function getTrimmedValue(element) {
	return getValue(element).trim();
}

function showModal(modal) {
	if (!modal) return false;

	modal.classList.add("show");
	modal.setAttribute("aria-hidden", "false");
	return true;
}

function hideModal(modal) {
	if (!modal) return;

	modal.classList.remove("show");
	modal.setAttribute("aria-hidden", "true");
}

function scrollToSection(id, options = { behavior: "smooth", block: "start" }) {
	const target = document.getElementById(id);
	if (!target) return false;

	target.scrollIntoView(options);
	return true;
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
	if (!target) return;

	target.textContent = "";
	target.style.backgroundImage = "";

	if (profile?.photo) {
		target.style.backgroundImage = `url("${profile.photo}")`;
		return;
	}

	target.textContent = getInitial(name);
}

function setPreviewPhoto(target, photo, name) {
	if (!target) return;

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

	setText(accountLabel, name ? "My Account" : "Login");
	setText(accountStatus, name ? "Profile saved" : "Login to save your profile");
	setValue(loginName, name);
	setValue(loginPhone, phone);
	setValue(loginEmail, email);
	setText(profileName, name || "Guest");
	setText(profilePhone, phone || "Not added");
	setText(profileEmail, email || "Not added");
	setValue(customerName, name);
	setValue(customerPhone, phone);
	setPhoto(profilePhoto, name);
	setPhoto(navAvatar, name);
	updateDashboardAccess();
}

function handleLogin(event) {
	event.preventDefault();
	saveProfile({
		name: getTrimmedValue(loginName),
		phone: getTrimmedValue(loginPhone),
		email: getTrimmedValue(loginEmail),
		photo: profile?.photo || "",
	});
	showToast("Profile saved");
	loadMyOrders();
}

function handleAuthLogin(event) {
	event.preventDefault();
	saveProfile({
		name: getTrimmedValue(authName),
		phone: getTrimmedValue(authPhone),
		email: getTrimmedValue(authEmail),
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
	authGate?.scrollIntoView({ behavior: "smooth", block: "start" });
	showToast("Logged out");
}

function openAccount() {
	if (!showModal(accountModal)) {
		showToast("Account panel is unavailable");
		return;
	}

	loadMyOrders();
}

function closeAccount() {
	hideModal(accountModal);
}

function openCart() {
	if (!showModal(cartModal)) {
		showToast("Cart panel is unavailable");
	}
}

function closeCart() {
	hideModal(cartModal);
}

async function openOrders() {
	if (!showModal(ordersModal)) {
		showToast("Orders panel is unavailable");
		return;
	}

	await loadOrders();
}

function closeOrders() {
	hideModal(ordersModal);
}

function updateProfilePhoto(file) {
	if (!file) return;
	const reader = new FileReader();
	reader.addEventListener("load", () => {
		saveProfile({
			name: getTrimmedValue(loginName) || profile?.name || "Account",
			phone: getTrimmedValue(loginPhone) || profile?.phone || "",
			email: getTrimmedValue(loginEmail) || profile?.email || "",
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
		setPreviewPhoto(authPhotoPreview, pendingAuthPhoto, getValue(authName));
	});
	reader.readAsDataURL(file);
}

async function loadMenu() {
	if (!menuGrid || !categories) return;

	try {
		const data = await api("/api/menu");
		dishes = data.menu;
		setText(dishCount, dishes.length);
		renderCategories();
		renderMenu();
	} catch (error) {
		menuGrid.innerHTML = `<p class="empty">${error.message}</p>`;
	}
}

function renderCategories() {
	if (!categories) return;

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
	if (!menuGrid) return;

	const query = getTrimmedValue(searchInput).toLowerCase();
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
	if (!dish) return;

	const current = cart.get(id) || { dish, qty: 0 };
	current.qty += 1;
	cart.set(id, current);
	showToast(`${dish.name} added`);
	renderCart();
}

function openBuyNow(id) {
	buyNowDish = dishes.find((item) => item.id === id);
	if (!buyNowDish) return;
	if (
		!buyModal ||
		!buyName ||
		!buyPhone ||
		!buyAddress ||
		!buyNote ||
		!buySummary
	) {
		showToast("Checkout panel is unavailable");
		return;
	}

	setValue(buyName, profile?.name || getValue(customerName));
	setValue(buyPhone, profile?.phone || getValue(customerPhone));
	setValue(buyAddress, getValue(customerAddress));
	setValue(buyNote, "");
	buySummary.innerHTML = `
    <img src="${buyNowDish.image}" alt="${buyNowDish.name}">
    <div>
      <span>Buy now</span>
      <strong>${buyNowDish.name}</strong>
      <p>${rupee(buyNowDish.price)} - ${buyNowDish.time}</p>
    </div>
  `;
	showModal(buyModal);
	buyAddress.focus();
}

function closeBuyNow() {
	hideModal(buyModal);
	buyNowDish = null;
}

async function placeBuyNow(event) {
	event.preventDefault();
	if (!buyNowDish) return;

	const addressParts = [
		getTrimmedValue(buyAddress),
		getTrimmedValue(buyNote),
	].filter(Boolean);
	const payload = {
		customer: {
			name: getTrimmedValue(buyName),
			phone: getTrimmedValue(buyPhone),
			address: addressParts.join(" - "),
		},
		items: [{ id: buyNowDish.id, qty: 1 }],
	};

	try {
		const data = await api("/api/orders", {
			method: "POST",
			body: JSON.stringify(payload),
		});
		setValue(customerName, payload.customer.name);
		setValue(customerPhone, payload.customer.phone);
		setValue(customerAddress, getTrimmedValue(buyAddress));
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

	setText(cartCount, count);
	setText(itemLabel, `${count} ${count === 1 ? "item" : "items"}`);
	setText(subtotal, rupee(sub));
	setText(delivery, fee === 0 ? "Free" : rupee(fee));
	setText(total, rupee(sub + fee));

	if (!cartItems) return;

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
			name: getValue(customerName),
			phone: getValue(customerPhone),
			address: getValue(customerAddress),
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
	if (!myOrdersList) return;

	myOrdersList.innerHTML = renderOrderCards(
		orders,
		profile
			? "No orders found for this account yet."
			: "Login to see your account orders.",
	);
}

async function loadMyOrders() {
	if (!myOrdersList) return;

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
	if (!ordersList) return;

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

function addSafeListener(id, event, handler) {
	const element = document.getElementById(id);

	if (element) {
		element.addEventListener(event, handler);
	}
}

addSafeListener("browseMenu", "click", () => {
	if (!scrollToSection("menu", { behavior: "smooth" })) {
		showToast("Menu section is unavailable");
	}
});

addSafeListener("cartButton", "click", openCart);

addSafeListener("accountButton", "click", openAccount);

addSafeListener("openAccount", "click", openAccount);

addSafeListener("accountEditButton", "click", openAccount);

addSafeListener("loadOrders", "click", openOrders);

addSafeListener("ordersButton", "click", openOrders);

addSafeListener("ordersInlineButton", "click", openOrders);

addSafeListener("refreshOrders", "click", loadOrders);

addSafeListener("refreshMyOrders", "click", loadMyOrders);

addSafeListener("loginForm", "submit", handleLogin);

addSafeListener("logoutButton", "click", logout);

addSafeListener("closeAccountModal", "click", closeAccount);

if (accountModal) {
	accountModal.addEventListener("click", (event) => {
		if (event.target === accountModal) {
			closeAccount();
		}
	});
}

addSafeListener("closeCartModal", "click", closeCart);

if (cartModal) {
	cartModal.addEventListener("click", (event) => {
		if (event.target === cartModal) {
			closeCart();
		}
	});
}

addSafeListener("closeOrdersModal", "click", closeOrders);

if (ordersModal) {
	ordersModal.addEventListener("click", (event) => {
		if (event.target === ordersModal) {
			closeOrders();
		}
	});
}

if (profilePhotoInput) {
	profilePhotoInput.addEventListener("change", () =>
		updateProfilePhoto(profilePhotoInput.files[0]),
	);
}

if (authForm) {
	authForm.addEventListener("submit", handleAuthLogin);
}

if (authPhotoInput) {
	authPhotoInput.addEventListener("change", () =>
		updateAuthPhoto(authPhotoInput.files[0]),
	);
}

if (authName) {
	authName.addEventListener("input", () =>
		setPreviewPhoto(authPhotoPreview, pendingAuthPhoto, getValue(authName)),
	);
}

addSafeListener("clearCart", "click", () => {
	cart.clear();
	renderCart();
	showToast("Cart cleared");
});

addSafeListener("orderForm", "submit", placeOrder);

addSafeListener("buyForm", "submit", placeBuyNow);

addSafeListener("closeBuyModal", "click", closeBuyNow);

if (buyModal) {
	buyModal.addEventListener("click", (event) => {
		if (event.target === buyModal) {
			closeBuyNow();
		}
	});
}

if (searchInput) {
	searchInput.addEventListener("input", renderMenu);
}

document.querySelectorAll(".service-strip button").forEach((button) => {
	button.addEventListener("click", () => {
		if (!button.dataset.target) return;

		scrollToSection(button.dataset.target, {
			behavior: "smooth",
			block: "start",
		});
	});
});

renderProfile();
renderCart();

if (profile?.name && profile?.phone) {
	loadMenu();
	loadOrders(false);
	loadMyOrders();
}
