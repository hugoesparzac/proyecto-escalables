require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
// Registrar modelos necesarios antes de usar Favorite
require('../infrastructure/database/models/Category');
require('../infrastructure/database/models/Product');
const Favorite = require('../infrastructure/database/models/Favorite');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafeteria';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function cleanFavorites() {
  const all = await Favorite.find();
  let removed = 0;
  for (const fav of all) {
    // Si el id_producto no es un ObjectId válido, eliminar
    if (typeof fav.id_producto !== 'object' && !mongoose.Types.ObjectId.isValid(fav.id_producto)) {
      await Favorite.deleteOne({ _id: fav._id });
      removed++;
    }
  }
  console.log(`Eliminados ${removed} favoritos corruptos.`);
  mongoose.disconnect();
}

cleanFavorites();
