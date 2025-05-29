const User = require('../../../infrastructure/database/models/User');

class ValidateEmail {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async execute(token) {
    if (!token) {
      throw new Error('Token no proporcionado');
    }
    
    console.log('🔍 Buscando usuario con token:', token);
    
    try {
      // Buscar usuario por token usando el repositorio
      const user = await this.userRepository.findByToken(token);
      
      if (!user) {
        console.log('❌ Usuario no encontrado con el token proporcionado - intentando búsqueda directa en la base de datos');
        
        // Intento directo en la base de datos como respaldo
        const dbUser = await User.findOne({ token: token });
        
        if (!dbUser) {
          console.log('❌ Usuario no encontrado ni siquiera en la base de datos');
          throw new Error('Token de validación inválido o expirado. Por favor solicita un nuevo enlace de validación.');
        }
        
        console.log('✅ Usuario encontrado directamente en la base de datos:', dbUser.correo);
        
        // Validar email directamente
        dbUser.validada = true;
        dbUser.token = null;
        dbUser.updatedAt = new Date();
        
        const savedUser = await dbUser.save();
        
        console.log('✅ Correo validado para (vía búsqueda directa):', savedUser.correo);
        
        return {
          user: savedUser.toJSON(),
          message: 'Correo electrónico validado exitosamente'
        };
      }
      
      console.log('✅ Usuario encontrado vía repositorio:', user.correo);
      
      // Actualizar el usuario a través del repositorio
      const updatedUser = await this.userRepository.validateEmail(user.id_usuario);
      
      if (!updatedUser) {
        console.log('❌ Error al actualizar vía repositorio, intentando actualización directa');
        
        // Intento directo en la base de datos como respaldo
        const updated = await User.findOneAndUpdate(
          { token: token },
          { validada: true, token: null, updatedAt: new Date() },
          { new: true }
        );
        
        if (!updated) {
          throw new Error('Error al validar el correo electrónico');
        }
        
        console.log('✅ Correo validado para (vía actualización directa):', updated.correo);
        
        return {
          user: updated.toJSON(),
          message: 'Correo electrónico validado exitosamente'
        };
      }
      
      console.log('✅ Correo validado para (vía repositorio):', updatedUser.correo);
      
      return {
        user: updatedUser.toJSON(),
        message: 'Correo electrónico validado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error durante la validación de email:', error);
      throw error;
    }
  }
}

module.exports = ValidateEmail;