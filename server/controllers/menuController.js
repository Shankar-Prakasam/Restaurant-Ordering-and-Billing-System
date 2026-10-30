const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

// @desc    Get all menu items (with search, category, veg filter, price sorting)
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, isVeg, sort, availableOnly } = req.query;
    const query = {};

    // Filter by available if specified or customer facing
    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    // Filter by category
    if (category && category !== 'all') {
      // Check if category is an ObjectId or categoryName
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        const cat = await Category.findOne({ categoryName: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (cat) {
          query.categoryId = cat._id;
        }
      }
    }

    // Filter by veg/non-veg
    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name-asc') sortOption = { name: 1 };

    const items = await MenuItem.find(query)
      .populate('categoryId', 'categoryName')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('categoryId', 'categoryName');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin only
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, categoryId, price, image, isAvailable, isVeg } = req.body;

    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, categoryId, and price',
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      categoryId,
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVeg: isVeg !== undefined ? isVeg : true,
    });

    const populatedItem = await MenuItem.findById(item._id).populate('categoryId', 'categoryName');

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin only
const updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, categoryId, price, image, isAvailable, isVeg } = req.body;
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    if (name) item.name = name;
    if (description !== undefined) item.description = description;
    if (categoryId) item.categoryId = categoryId;
    if (price !== undefined) item.price = Number(price);
    if (image !== undefined) item.image = image;
    if (typeof isAvailable === 'boolean') item.isAvailable = isAvailable;
    if (typeof isVeg === 'boolean') item.isVeg = isVeg;

    await item.save();

    const populatedItem = await MenuItem.findById(item._id).populate('categoryId', 'categoryName');

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      item: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin only
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
