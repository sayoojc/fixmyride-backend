import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { UserRepository } from '../repositories/user.repo'; // Adjust paths
import userModel from '../models/user.model';
import  jwt  from 'jsonwebtoken';

const userRepository = new UserRepository(userModel);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id, displayName, emails } = profile;
    const email = emails![0].value;
    const profilePicture = profile._json.picture

    let user = await userRepository.findUserByEmail(email);

    if (!user) {
      user = await userRepository.createUserFromGoogle(
        id,
        displayName,
        email,
        profilePicture || ""
      );
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    // Send the user data and JWT token
    done(null, { user, accessToken, refreshToken });
  } catch (err) {
    return done(err, false);
  }
}));

// serialize/deserialize (only if you use sessions)
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id: string, done) => {
  const user = await userRepository.findUserById(id);
  done(null, user);
});


