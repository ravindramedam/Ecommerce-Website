const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../middlewares/responseHandler");

const displayPrice = (product) => {
  const extra = Number(product.discount) || 0;
  if (extra > 0) return Math.round(product.price - product.price * (extra / 100));
  return product.price;
};

const readUser = async (req) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isBlocked) return null;
    return user;
  } catch (error) {
    return null;
  }
};

const isOrderQuestion = (text) =>
  /\b(my order|my orders|where is my|order status|track(?:ing)?|cancelled order|canceled order)\b/i.test(text) ||
  (/\b(cancelled|canceled|delivered)\b/i.test(text) && !/\b(how|policy|return)\b/i.test(text));

const isHelpQuestion = (text) =>
  /\b(return|returns|cancel|cancellation|shipping|delivery|cod|cash on delivery)\b/i.test(text);

const isSupportQuestion = (text) =>
  /\b(support|customer care|contact|phone number|call us|helpline|quer(?:y|ies))\b/i.test(text);

const supportLine = "For any queries, contact our customer support at 9010076453.";

const helpReply = () =>
  `Pending orders can be cancelled instantly. Processing orders need admin approval. Shipped orders cannot be cancelled. Returns are for damaged or incorrect products reported within 48 hours, and the item must be unused in its original packaging. Delivery times are estimates, and payment is cash on delivery. ${supportLine}`;

const findProducts = async (text) => {
  const underMatch = text.match(/\b(?:under|below|less than)\s+₹?\s*(\d+)/i);
  const maxPrice = underMatch ? Number(underMatch[1]) : null;
  const wantsDeals = /\b(deal|deals|offer|offers|discount|sale)\b/i.test(text);

  let searchTerm = text
    .replace(/\b(?:under|below|less than)\s+₹?\s*\d+/gi, " ")
    .replace(/\b(show|me|find|search|looking|for|a|an|the|some|any|please|products?|items?|deals?|offers?|discount|sale|under|below)\b/gi, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (searchTerm.endsWith("s") && searchTerm.length > 3) {
    searchTerm = searchTerm.slice(0, -1);
  }

  const query = {};
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { tags: { $regex: searchTerm, $options: "i" } },
      { brand: { $regex: searchTerm, $options: "i" } },
    ];
  }
  if (wantsDeals && !searchTerm) query.discount = { $gt: 0 };

  const sort = wantsDeals ? { discount: -1 } : { createdAt: -1 };
  let products = await Product.find(query).sort(sort).limit(maxPrice ? 40 : 5);
  if (maxPrice) {
    products = products.filter((product) => displayPrice(product) <= maxPrice).slice(0, 5);
  }

  return products.map((product) => ({
    id: product._id,
    name: product.name,
    price: displayPrice(product),
  }));
};

const findOrders = async (user, text) => {
  const query = { user: user._id };
  const statusMatch = text.match(/\b(pending|processing|shipped|delivered|cancelled)\b/i);
  if (statusMatch) query.status = new RegExp(`^${statusMatch[1]}$`, "i");

  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(5);
  return orders.map((order) => ({
    id: order._id,
    status: order.status,
    total: order.totalAmount,
  }));
};

exports.chat = async (req, res, next) => {
  try {
    const message = String(req.body.message || "").trim();
    if (!message) return errorResponse(res, "Type a message first.", 400);

    const user = await readUser(req);

    if (/^(hi+|hello+|hey|helo|help)[!.?\s]*$/i.test(message)) {
      return successResponse(res, "Chat reply", {
        reply: "Hello! How can I assist you?",
        products: [],
        orders: [],
      });
    }

    if (isOrderQuestion(message)) {
      if (!user) {
        return successResponse(res, "Chat reply", {
          reply: "Sign in to see your orders.",
          products: [],
          orders: [],
        });
      }

      const orders = await findOrders(user, message);
      const reply = orders.length
        ? orders.map((order) => `Order #${String(order.id).slice(-6).toUpperCase()} is ${order.status} (₹${order.total}).`).join(" ")
        : `I couldn't find an order that matches that. ${supportLine}`;

      return successResponse(res, "Chat reply", { reply, products: [], orders });
    }

    if (isHelpQuestion(message)) {
      return successResponse(res, "Chat reply", {
        reply: helpReply(),
        products: [],
        orders: [],
      });
    }

    if (isSupportQuestion(message)) {
      return successResponse(res, "Chat reply", {
        reply: supportLine,
        products: [],
        orders: [],
      });
    }

    const products = await findProducts(message);
    const reply = products.length
      ? products.map((product) => `${product.name} is ₹${product.price}.`).join(" ")
      : `I couldn't find a matching product. ${supportLine}`;

    return successResponse(res, "Chat reply", { reply, products, orders: [] });
  } catch (error) {
    next(error);
  }
};
