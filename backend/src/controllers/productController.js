// backend/src/controllers/productController.js

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category"); // <-- IMPORTED CATEGORY MODEL
const { successResponse, errorResponse } = require("../middlewares/responseHandler");

// 1. Adding a new product
exports.addProduct = async (req, res, next) => {
  try {
    // Destructure ALL new fields
    const { 
      name, price, mrp, category, subcategory, description, images, brand, 
      discount, tags, stock, hasVariants, variants, specifications,
      featured, trending, isDealOfTheDay, dealExpiry 
    } = req.body;

    // Basic Validations
    if (stock < 0) return errorResponse(res, "Stock cannot be negative", 400);
    if (!Array.isArray(images) || images.length === 0) return errorResponse(res, "Images must be a non-empty array", 400);
    if (price <= 0) return errorResponse(res, "Price must be greater than 0", 400);
    if (mrp < price) return errorResponse(res, "MRP must be greater than or equal to Selling Price", 400);

    // Validate Category (Check if the ID exists in Category collection)
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return errorResponse(res, "Invalid Category ID. Please select a valid category.", 400);

    const newProduct = new Product({ 
      name, price, mrp, category, subcategory, description, images, brand, 
      discount, tags, stock, hasVariants, variants, specifications,
      featured, trending, isDealOfTheDay, dealExpiry 
    });

    await newProduct.save();

    return successResponse(res, "Product added successfully!", { product: newProduct }, 201);
  } catch (error) {
    next(error);
  }
};

// 2. Updating a product details
exports.updateProduct = async (req, res, next) => {
  try {
    // We allow updating all fields
    const updates = req.body;

    // Quick validation checks if specific fields are being updated
    if (updates.stock !== undefined && updates.stock < 0) return errorResponse(res, "Stock can't be negative", 400);
    if (updates.price && updates.price <= 0) return errorResponse(res, "Price must be greater than 0", 400);
    
    // If updating category, verify it exists
    if (updates.category) {
        const categoryExists = await Category.findById(updates.category);
        if (!categoryExists) return errorResponse(res, "Invalid Category ID", 400);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, 
        updates, 
        { new: true, runValidators: true }
    ).populate("category", "name slug"); // Return category details after update

    if (!updatedProduct) return errorResponse(res, "Sorry! Product not found!", 404);

    return successResponse(res, "Product updated successfully!", { product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// 3. Removing a product
exports.removeProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return errorResponse(res, "Product not found!", 404);

    return successResponse(res, "Product removed successfully!", { product: deletedProduct });
  } catch (error) {
    next(error);
  }
};

// 4. Bulk Delete Products
exports.bulkRemoveProducts = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return errorResponse(res, "Access denied. Admins only.", 403);
    }

    const { productIds } = req.body; 

    if (!productIds || productIds.length === 0) {
      return errorResponse(res, "No product IDs provided", 400);
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } });

    return successResponse(res, `${result.deletedCount} products removed successfully`);
  } catch (error) {
    next(error);
  }
};

// 5. Fetching all products (with pagination & sorting)
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    // .populate('category') replaces the ID with the actual Category object (name, image, etc.)
    const products = await Product.find()
        .populate("category", "name slug") 
        .sort({ createdAt: -1 })
        .limit(limitNumber)
        .skip(skip);

    const totalProducts = await Product.countDocuments();

    return successResponse(res, "Products fetched successfully", { totalProducts, page: pageNumber, limit: limitNumber, products });
  } catch (error) {
    next(error);
  }
};

// 6. Search and Filter Products
exports.searchAndFilterProducts = async (req, res, next) => {
  try {
    const { searchTerm, category, subcategory, minPrice, maxPrice, sortBy, page = 1, limit = 10 } = req.query;
    
    let query = {};

    // A. Text Search
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } } 
      ];
    }

    // B. Category Filter (UPDATED LOGIC)
    if (category) {
        // 1. Split the comma-separated string into an array (e.g. "Shirts,Pants" -> ["Shirts", "Pants"])
        const categoryNames = category.split(',').map(c => c.trim());

        // 2. Find ALL categories that match ANY of these names (Case-insensitive)
        const categoryDocs = await Category.find({ 
            name: { $in: categoryNames.map(name => new RegExp(`^${name}$`, "i")) } 
        });

        // 3. Extract the ObjectIds
        const categoryIds = categoryDocs.map(cat => cat._id);

        // 4. If we found matching categories, filter products by those IDs
        if (categoryIds.length > 0) {
            query.category = { $in: categoryIds };
        } else {
            // If categories were requested but none exist in DB, return 0 products immediately
            return successResponse(res, "No products found", { totalProducts: 0, products: [], page: 1, limit });
        }
    }

    // C. Subcategory Filter (Optional: You can apply similar logic here if you want multiple subcategories)
    if (subcategory) {
        query.subcategory = new RegExp(subcategory, "i");
    }

    // D. Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // E. Sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      priceLowToHigh: { price: 1 },
      priceHighToLow: { price: -1 },
      ratings: { "ratings.averageRating": -1 },
      topDiscounts: { discount: -1 } 
    };

    const sort = sortOptions[sortBy] || sortOptions.newest;

    // Pagination
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate("category", "name slug") // Populate category details
        .sort(sort)
        .skip(skip)
        .limit(limitNumber);

    return successResponse(res, "Products fetched successfully", { totalProducts, products, page: pageNumber, limit: limitNumber });
  } catch (error) {
    next(error);
  }
};

// 7. Fetching a single product by its ID
exports.getProductById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, "Product not found", 404);
    }

    const product = await Product.findById(req.params.id).populate("category", "name slug");

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, "Product fetched successfully", { data: product });
  } catch (error) {
    next(error);
  }
};

// 8. Get Homepage Data (Row 1, Row 2, Deal)
exports.getHomepageProducts = async (req, res, next) => {
    try {
      // 1. Fetching Featured (Row 1)
      const featured = await Product.find({ featured: true, isActive: true })
        .populate("category", "name")
        .limit(8);
  
      // 2. Fetching Trending (Row 2)
      const trending = await Product.find({ trending: true, isActive: true })
        .populate("category", "name")
        .limit(8);
  
      // 3. Fetching New Arrivals (Row 3 - Optional if you use it)
      const newArrivals = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(8);
  
      // 4. Fetching Deal of the Day
      const dealOfTheDay = await Product.find({ 
        isDealOfTheDay: true,
        dealExpiry: { $gt: new Date() },
        isActive: true
      })
      .populate("category", "name")
      .limit(4);
  
      return successResponse(res, "Homepage products fetched", { 
        featured,       
        trending,
        newArrivals,
        dealOfTheDay
      });

    } catch (error) {
      next(error);
    }
};