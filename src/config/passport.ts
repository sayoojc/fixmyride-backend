import { Strategy as GoogleStrategy,Profile, VerifyCallback  } from 'passport-google-oauth20';
import passport from 'passport';
import { UserRepository } from '../repositories/user.repo';
import { ProviderRepository } from '../repositories/provider.repo';
import userModel from '../models/user.model';
import providerModel from '../models/provider.model'
import  jwt  from 'jsonwebtoken';

const userRepository = new UserRepository(userModel);
const providerRepository = new ProviderRepository(providerModel)
import { Request } from 'express';
type GoogleCallbackParameters = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
  token_type: string;
};


passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "http://localhost:5000/api/google/callback",
    passReqToCallback: true,
  },
  async (
    req: Request,
    accessToken: string,
    refreshToken: string,
    params: GoogleCallbackParameters, // <- This is the missing parameter!
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const { id, displayName, emails } = profile;
      const email = emails![0].value;
      const profilePicture = profile._json.picture;

      const type = req.query.state;
      console.log('req.query',req.query);
      console.log('Google login/signup type:', type);

      if (type === 'user') {
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

        done(null, { user, accessToken, refreshToken });
      } else {
        let provider = await providerRepository.findProviderByEmail(email);
        if (!provider) {
          provider = await providerRepository.createUserFromGoogle(
            id,
            displayName,
            email,
          );
        }

        const accessToken = jwt.sign(
          { id: provider.id, email: provider.email },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
          { id: provider.id },
          process.env.REFRESH_TOKEN_SECRET!,
          { expiresIn: "1d" }
        );

        done(null, { provider, accessToken, refreshToken });
      }
    } catch (err) {
      return done(err as Error, false);
    }
  }
));


// serialize/deserialize (only if you use sessions)
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id: string, done) => {
  const user = await userRepository.findUserById(id);
  done(null, user);
});


