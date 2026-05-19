import mongoose from 'mongoose';

const SectorEntrySchema = new mongoose.Schema({
  sector:       String,
  city:         String,
  propertyType: String,
  listingType:  String,
  count:        Number,
  medianPrice:  Number,
  minPrice:     Number,
  maxPrice:     Number,
  avgArea:      Number,
  pricePerSqft: Number,
  trend:        Number,    // % vs prev quarter, null = first time
  priceTag:     String,    // 'Overpriced' | 'Fair Market' | 'Value Deal' | 'New Data'
}, { _id: false });

const YieldEntrySchema = new mongoose.Schema({
  sector:       String,
  city:         String,
  propertyType: String,
  salePrice:    Number,
  monthlyRent:  Number,
  annualYield:  Number,
  yieldTag:     String,
  pricePerSqft: Number,
}, { _id: false });

const MarketIndexSchema = new mongoose.Schema({
  quarter:            { type: String, required: true },  // 'Q2-2025'
  year:               { type: Number, required: true },
  generatedAt:        { type: Date, default: Date.now },
  rentData:           [SectorEntrySchema],
  saleData:           [SectorEntrySchema],
  yieldData:          [YieldEntrySchema],
  totalListings:      Number,
});

// Keep only latest 8 quarters — auto-prune on save
MarketIndexSchema.post('save', async function () {
  const Model = this.constructor;
  const all   = await Model.find().sort({ generatedAt: -1 }).select('_id');
  if (all.length > 8) {
    const toDelete = all.slice(8).map(d => d._id);
    await Model.deleteMany({ _id: { $in: toDelete } });
  }
});

export default mongoose.models.MarketIndex ||
  mongoose.model('MarketIndex', MarketIndexSchema);
