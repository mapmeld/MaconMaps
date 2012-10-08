var mongoose = require('mongoose'),
  mongoose_auth = require('mongoose-auth'),
  Schema = mongoose.Schema;

var TimePointSchema = new Schema({
  ll: Array,
  start: Number,
  end: Number
});

TimePointSchema.index({
  ll: "2d"
});

var TimePoint = mongoose.model('TimePoint', TimePointSchema);

exports.TimePoint = TimePoint;