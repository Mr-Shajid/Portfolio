import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // We store only the hash, never the password itself
    passwordHash: {
      type: String,
      required: true,
      select: false, // queries skip this field unless explicitly asked
    },
  },
  { timestamps: true }
)

export default mongoose.model('Admin', adminSchema)