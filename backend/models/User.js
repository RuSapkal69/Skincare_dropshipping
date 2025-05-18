import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcrypt';
import { randomBytes, createHash } from 'crypto';

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid phone number']
  },
  addresses: [
    {
      addressType: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
      },
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  demographics: {
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    ageGroup: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate email verification token
UserSchema.methods.getVerificationToken = function() {
  // Generate token
  const verificationToken = randomBytes(20).toString('hex');
  
  // Hash token and set to verificationToken field
  this.verificationToken = createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  return verificationToken;
};

export default model('User', UserSchema);