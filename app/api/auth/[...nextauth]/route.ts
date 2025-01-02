import NextAuth from "next-auth"
import { authOptions } from "./options"

const handler =  NextAuth(authOptions);

export { handler as GET, handler as POST}
// export const { 
//   handler: { GET, POST },  
//   auth, 
//   signIn, 
//   signOut 
// } = NextAuth(authOptions)