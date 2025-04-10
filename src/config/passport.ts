import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userRepository from "../repositories/user.repo";
import generateToken from "../utils/generateToken";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userRepository.findUserByEmail(profile.emails?.[0].value || "");

        if (!user) {
          // Create new user in the database
          user = await userRepository.createUser({
            name: profile.displayName,
            email: profile.emails?.[0].value || "",
           
          });
        }

        // Generate JWT token
        const token = generateToken(user._id.toString());

        return done(null, { user, token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
