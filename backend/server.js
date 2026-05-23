const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const APP_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(APP_ROOT, "frontend");

/* ---------------- MongoDB Connection ---------------- */

mongoose
	.connect(
		process.env.MONGO_URI ||
			"mongodb://admin:pass123@mongodb:27017/mydatabase?authSource=admin",
	)
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.log(err));

/* ---------------- MongoDB Schema ---------------- */

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

const Order = mongoose.model("Order", OrderSchema);

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
		/* GET MENU */

		if (req.method === "GET" && url.pathname === "/api/menu") {
			sendJson(res, 200, { menu });
			return;
		}

		/* GET ORDERS */

		if (req.method === "GET" && url.pathname === "/api/orders") {
			const orders = await Order.find().sort({
				createdAt: -1,
			});

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

			const savedOrder = await Order.create(orderData);

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
