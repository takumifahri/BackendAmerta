import AuthMailer from "./mailer/auth.mailer.js";
import ProfileMailer from "./mailer/profile.mailer.js";

/**
 * Hub for all mailers
 */
export const Mailers = {
    auth: AuthMailer,
    profile: ProfileMailer
};

export default AuthMailer; // Keep as default for backward compatibility if needed, but preferred to use Mailers.auth
