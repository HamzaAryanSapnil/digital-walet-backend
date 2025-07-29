import bcryptjs from "bcryptjs";
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { envVars } from "./env";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExists = await User.findOne({ email });

        // if (!isUserExists) {
        //   return done(null, false, { message: "User doesn't exists" });
        // }

        if (!isUserExists) {
          return done("User doesn't exists");
        }

        const isGoogleAuthenticated = isUserExists.auths.some(
          (providerObjects) => providerObjects.provider == "google"
        );

        if (isGoogleAuthenticated && !isUserExists.password) {
          return done(
            "You have authenticated through google login. If you want to login with credentials, then at first login with google and set a password for your gmail. And then you can login in with email and password"
          );
        }

        const isPassMatched = await bcryptjs.compare(
          password as string,
          isUserExists.password as string
        );

        if (!isPassMatched) {
          return done(null, false, { message: "Password Doesn't Matched." });
        }

        return done(null, isUserExists);
      } catch (err) {
        if (envVars.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log(err);
        }
        done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(null, false, { mesaage: "No email found" });
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, user);
      } catch (error) {
        if (envVars.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log("Google Strategy Error", error);
        }
        return done(error);
      }
    }
  )
);

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    if (envVars.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(error);
    }
    done(error);
  }
});
