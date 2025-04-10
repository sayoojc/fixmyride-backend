export const TYPES = {
    // ✅ Repositories
    MailRepository: Symbol.for("MailRepository"),
    UserRepository: Symbol.for("UserRepository"),
    TempUserRepository: Symbol.for("TempUserRepository"),
    RefreshTokenRepository: Symbol.for("RefreshTokenRepository"),
  
    // ✅ Services
    MailService: Symbol.for("MailService"),
    AuthService: Symbol.for("AuthService"),
  
    // ✅ Controllers
    AuthController: Symbol.for("AuthController")
  };
  