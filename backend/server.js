const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

let mongoose;

try {
	mongoose = require("mongoose");
} catch (_error) {
	mongoose = null;
}

const PORT = process.env.PORT || 3000;

const APP_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(APP_ROOT, "frontend");
const ORDERS_FILE = path.join(APP_ROOT, "mongodb", "seed", "orders.json");

/* ---------------- MongoDB Connection ---------------- */

let Order = null;
let mongoReady = false;

if (mongoose) {
	mongoose.set("bufferCommands", false);

	const OrderSchema = new mongoose.Schema({
		id: String,
		status: String,
		createdAt: String,
		customer: {
			name: String,
			phone: String,
			address: String,
		},
		items: Array,
		subtotal: Number,
		delivery: Number,
		total: Number,
	});

	Order = mongoose.model("Order", OrderSchema);

	mongoose
		.connect(
			process.env.MONGO_URI ||
				"mongodb://admin:pass123@mongodb:27017/mydatabase?authSource=admin",
			{ serverSelectionTimeoutMS: 1600 },
		)
		.then(() => {
			mongoReady = true;
			console.log("MongoDB connected");
		})
		.catch((error) => {
			mongoReady = false;
			console.log(`Using local order storage: ${error.message}`);
		});
} else {
	console.log("Using local order storage: mongoose is not installed");
}

/* ---------------- Menu Data ---------------- */

const menu = [
	{
		id: 1,
		name: "Hyderabadi Dum Biryani",
		category: "Indian",
		price: 289,
		time: "28 min",
		rating: "4.9",
		desc: "Long grain rice, saffron, mint, fried onions, and slow-cooked spices.",
		image:
			"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 2,
		name: "Paneer Tikka Wrap",
		category: "Wraps",
		price: 179,
		time: "18 min",
		rating: "4.7",
		desc: "Smoky paneer, crunchy onions, mint chutney, and soft roomali wrap.",
		image:
			"https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 3,
		name: "Margherita Pizza",
		category: "Pizza",
		price: 349,
		time: "24 min",
		rating: "4.8",
		desc: "San Marzano tomato sauce, mozzarella, basil, and crisp crust.",
		image:
			"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 4,
		name: "Classic Cheeseburger",
		category: "Burgers",
		price: 249,
		time: "22 min",
		rating: "4.6",
		desc: "Grilled patty, cheddar, lettuce, tomato, pickles, and house sauce.",
		image:
			"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 5,
		name: "Veg Hakka Noodles",
		category: "Chinese",
		price: 199,
		time: "20 min",
		rating: "4.5",
		desc: "Wok-tossed noodles with peppers, cabbage, spring onion, and soy.",
		image:
			"https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 6,
		name: "Chocolate Brownie Sundae",
		category: "Desserts",
		price: 149,
		time: "14 min",
		rating: "4.8",
		desc: "Warm brownie, vanilla ice cream, chocolate sauce, and nuts.",
		image:
			"https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 7,
		name: "Butter Chicken Bowl",
		category: "Indian",
		price: 319,
		time: "26 min",
		rating: "4.9",
		desc: "Creamy butter chicken, jeera rice, pickled onions, and chutney.",
		image:
			"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 8,
		name: "Cold Coffee Shake",
		category: "Drinks",
		price: 129,
		time: "10 min",
		rating: "4.7",
		desc: "Chilled coffee blended with milk, ice cream, and chocolate.",
		image:
			"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: 9,
		name: "Loaded Masala Fries",
		category: "Snacks",
		price: 159,
		time: "16 min",
		rating: "4.6",
		desc: "Crisp fries topped with masala, cheese sauce, herbs, and onions.",
		image:
			"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
	},
];

/* ---------------- MIME Types ---------------- */

const mimeTypes = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml",
};

/* ---------------- Helpers ---------------- */

function sendJson(res, status, payload) {
	res.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
	});

	res.end(JSON.stringify(payload));
}

async function readBody(req) {
	const chunks = [];

	for await (const chunk of req) {
		chunks.push(chunk);
	}

	const raw = Buffer.concat(chunks).toString("utf8");

	return raw ? JSON.parse(raw) : {};
}

async function readLocalOrders() {
	try {
		const raw = await fs.readFile(ORDERS_FILE, "utf8");
		const orders = JSON.parse(raw);

		return Array.isArray(orders) ? orders : [];
	} catch (error) {
		if (error.code === "ENOENT") {
			return [];
		}

		throw error;
	}
}

async function writeLocalOrders(orders) {
	await fs.mkdir(path.dirname(ORDERS_FILE), { recursive: true });
	await fs.writeFile(ORDERS_FILE, `${JSON.stringify(orders, null, "\t")}\n`);
}

function sortOrders(orders) {
	return [...orders].sort(
		(first, second) => new Date(second.createdAt) - new Date(first.createdAt),
	);
}

async function getOrders() {
	if (mongoReady && Order) {
		try {
			return await Order.find().sort({ createdAt: -1 }).lean();
		} catch (error) {
			mongoReady = false;
			console.log(`Falling back to local orders: ${error.message}`);
		}
	}

	return sortOrders(await readLocalOrders());
}

async function saveOrder(orderData) {
	if (mongoReady && Order) {
		try {
			return await Order.create(orderData);
		} catch (error) {
			mongoReady = false;
			console.log(`Saving order locally: ${error.message}`);
		}
	}

	const orders = await readLocalOrders();
	const nextOrders = [orderData, ...orders];
	await writeLocalOrders(nextOrders);
	return orderData;
}

/* ---------------- Order Builder ---------------- */

function buildOrder(body) {
	const customer = body.customer || {};
	const items = Array.isArray(body.items) ? body.items : [];

	if (!customer.name || !customer.phone || !customer.address) {
		return {
			error: "Name, phone, and address are required.",
		};
	}

	const orderItems = items
		.map((item) => {
			const dish = menu.find((entry) => entry.id === Number(item.id));

			const qty = Number(item.qty);

			if (!dish || !Number.isInteger(qty) || qty <= 0) {
				return null;
			}

			return {
				id: dish.id,
				name: dish.name,
				price: dish.price,
				qty,
				lineTotal: dish.price * qty,
			};
		})
		.filter(Boolean);

	if (orderItems.length === 0) {
		return {
			error: "Add at least one valid menu item.",
		};
	}

	const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

	const delivery = subtotal >= 799 ? 0 : 49;

	return {
		id: `BR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,

		status: "received",

		createdAt: new Date().toISOString(),

		customer: {
			name: String(customer.name).trim(),
			phone: String(customer.phone).trim(),
			address: String(customer.address).trim(),
		},

		items: orderItems,

		subtotal,
		delivery,
		total: subtotal + delivery,
	};
}

/* ---------------- Static File Server ---------------- */

async function serveStatic(req, res) {
	const url = new URL(req.url, `http://${req.headers.host}`);

	const requestedPath = decodeURIComponent(
		url.pathname === "/" ? "/index.html" : url.pathname,
	);

	const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

	if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) {
		res.writeHead(403);
		res.end("Forbidden");
		return;
	}

	try {
		const file = await fs.readFile(filePath);

		const ext = path.extname(filePath).toLowerCase();

		res.writeHead(200, {
			"Content-Type": mimeTypes[ext] || "application/octet-stream",
		});

		res.end(file);
	} catch (_error) {
		res.writeHead(404, {
			"Content-Type": "text/plain; charset=utf-8",
		});

		res.end("Not found");
	}
}

/* ---------------- Router ---------------- */

async function router(req, res) {
	const url = new URL(req.url, `http://${req.headers.host}`);

	try {

				/* HEALTH CHECK */

		if (req.method === "GET" && url.pathname === "/health") {
			sendJson(res, 200, {
				status: "UP",
				service: "food-app-backend",
				timestamp: new Date().toISOString(),
			});

			return;
		}

		/* READINESS CHECK */

		if (req.method === "GET" && url.pathname === "/ready") {
			if (!mongoReady) {
				sendJson(res, 503, {
					status: "NOT_READY",
					mongoReady: false,
				});

				return;
			}

			sendJson(res, 200, {
				status: "READY",
				mongoReady: true,
				timestamp: new Date().toISOString(),
			});

			return;
		}

		/* GET MENU */

		if (req.method === "GET" && url.pathname === "/api/menu") {
			sendJson(res, 200, { menu });
			return;
		}

		/* GET ORDERS */

		if (req.method === "GET" && url.pathname === "/api/orders") {
			const orders = await getOrders();

			sendJson(res, 200, { orders });

			return;
		}

		/* CREATE ORDER */

		if (req.method === "POST" && url.pathname === "/api/orders") {
			const orderData = buildOrder(await readBody(req));

			if (orderData.error) {
				sendJson(res, 400, {
					error: orderData.error,
				});

				return;
			}

			const savedOrder = await saveOrder(orderData);

			sendJson(res, 201, {
				order: savedOrder,
			});

			return;
		}

		/* STATIC FILES */

		await serveStatic(req, res);
	} catch (error) {
		sendJson(res, 500, {
			error: "Server error",
			detail: error.message,
		});
	}
}

/* ---------------- Start Server ---------------- */

http.createServer(router).listen(PORT, () => {
	console.log(`Food app running at http://localhost:${PORT}`);
});
