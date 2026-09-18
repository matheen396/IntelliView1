import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import dotenv from "dotenv";
import { prisma } from "./database";

// Load environment variables
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Email not found from Google"), undefined);
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.name?.givenName || "User",
              picture: profile.photos?.[0]?.value,
              googleId: profile.id,
              isValidated: true, // Auto-validate Google users
              role: "STUDENT", // Default role
            },
          });
          console.log(`✅ New user created: ${email}`);
        } else if (!user.googleId) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { email },
            data: {
              googleId: profile.id,
              picture: user.picture || profile.photos?.[0]?.value,
              isValidated: true,
            },
          });
          console.log(`✅ Google account linked: ${email}`);
        }

        // Update last login timestamp
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        console.log(`✅ User authenticated: ${email} (Role: ${user.role})`);

        // Return the user to passport
        return done(null, user);
      } catch (error) {
        console.error("❌ Google OAuth error:", error);
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
