import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  currency: {
    type: String,
    enum: ['INR', 'USD'],
    required: true
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  origin: {
    type: String,
    enum: ['India', 'Global'],
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  subcategory: {
    type: String
  },
  tags: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  inventory: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    enum: ['GlowRoad', 'Spocket', 'CJDropshipping', 'Other'],
    required: true
  },
  sourceId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default model('Product', ProductSchema);