import { type Adapter } from 'next-auth/adapters';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from './connection';

export function MongoDBAdapter(): Adapter {
  return {
    async createUser(user) {
      const { db } = await connectToDatabase();
      
      // Check if user should be admin by querying the admins collection
      const adminUser = await db.collection('admins').findOne({ email: user.email });
      const isExistingAdmin = !!adminUser;
      
      const userData = {
        ...user,
        role: isExistingAdmin ? 'admin' : 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection(isExistingAdmin ? 'admins' : 'clients').insertOne(userData);
      
      return {
        ...userData,
        id: result.insertedId.toString()
      } as any;
    },

    async getUser(id) {
      const { db } = await connectToDatabase();
      
      // Try to find in clients first
      let user = await db.collection('clients').findOne({ _id: new ObjectId(id) });
      
      // If not found, try admins
      if (!user) {
        user = await db.collection('admins').findOne({ _id: new ObjectId(id) });
      }
      
      if (!user) return null;
      
      return {
        ...user,
        id: user._id.toString()
      } as any;
    },

    async getUserByEmail(email) {
      const { db } = await connectToDatabase();
      
      // Try to find in clients first
      let user = await db.collection('clients').findOne({ email });
      
      // If not found, try admins
      if (!user) {
        user = await db.collection('admins').findOne({ email });
      }
      
      if (!user) return null;
      
      return {
        ...user,
        id: user._id.toString()
      } as any;
    },

    async getUserByAccount(providerAccountId) {
      const { db } = await connectToDatabase();
      
      const account = await db.collection('accounts').findOne({
        providerAccountId: providerAccountId.providerAccountId,
        provider: providerAccountId.provider
      });
      
      if (!account) return null;
      
      // Try to find in clients first
      let user = await db.collection('clients').findOne({ _id: new ObjectId(account['userId']) });
      
      // If not found, try admins
      if (!user) {
        user = await db.collection('admins').findOne({ _id: new ObjectId(account['userId']) });
      }
      
      if (!user) return null;
      
      return {
        ...user,
        id: user._id.toString()
      } as any;
    },

    async updateUser(user) {
      const { db } = await connectToDatabase();
      
      const updateData: any = { ...user };
      delete updateData.id;
      updateData.updatedAt = new Date();
      
      // Determine which collection to update
      const collectionName = user.role === 'admin' ? 'admins' : 'clients';
      
      await db.collection(collectionName).updateOne(
        { _id: new ObjectId(user.id) },
        { $set: updateData }
      );
      
      const updatedUser = await db.collection(collectionName).findOne({ _id: new ObjectId(user.id) });
      
      return {
        ...updatedUser,
        id: updatedUser!._id.toString()
      } as any;
    },

    async deleteUser(userId) {
      const { db } = await connectToDatabase();
      
      // Delete from both collections (just in case)
      await db.collection('clients').deleteOne({ _id: new ObjectId(userId) });
      await db.collection('admins').deleteOne({ _id: new ObjectId(userId) });
      await db.collection('accounts').deleteMany({ userId });
      await db.collection('sessions').deleteMany({ userId });
    },

    async linkAccount(account) {
      const { db } = await connectToDatabase();
      
      const accountData = {
        ...account,
        userId: account.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('accounts').insertOne(accountData);
      
      return accountData as any;
    },

    async unlinkAccount(providerAccountId) {
      const { db } = await connectToDatabase();
      
      await db.collection('accounts').deleteOne({
        providerAccountId: providerAccountId.providerAccountId,
        provider: providerAccountId.provider
      });
    },

    async createSession(session) {
      const { db } = await connectToDatabase();
      
      const sessionData = {
        ...session,
        userId: session.userId,
        expires: new Date(session.expires),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('sessions').insertOne(sessionData);
      
      return sessionData as any;
    },

    async getSessionAndUser(sessionToken) {
      const { db } = await connectToDatabase();
      
      const session = await db.collection('sessions').findOne({ sessionToken });
      
      if (!session) return null;
      
      // Try to find in clients first
      let user = await db.collection('clients').findOne({ _id: new ObjectId(session['userId']) });
      
      // If not found, try admins
      if (!user) {
        user = await db.collection('admins').findOne({ _id: new ObjectId(session['userId']) });
      }
      
      if (!user) return null;
      
      return {
        session: {
          ...session,
          id: session._id.toString(),
          userId: session['userId'],
          expires: session['expires']
        },
        user: {
          ...user,
          id: user._id.toString()
        }
      } as any;
    },

    async updateSession(session) {
      const { db } = await connectToDatabase();
      
      const updateData: any = { ...session };
      delete updateData.sessionToken;
      updateData.updatedAt = new Date();
      
      await db.collection('sessions').updateOne(
        { sessionToken: session.sessionToken },
        { $set: updateData }
      );
      
      const updatedSession = await db.collection('sessions').findOne({ sessionToken: session.sessionToken });
      
      return updatedSession ? {
        ...updatedSession,
        id: updatedSession._id.toString(),
        userId: updatedSession['userId'],
        expires: updatedSession['expires']
      } as any : null;
    },

    async deleteSession(sessionToken) {
      const { db } = await connectToDatabase();
      
      await db.collection('sessions').deleteOne({ sessionToken });
    },

    async createVerificationToken(verificationToken) {
      const { db } = await connectToDatabase();
      
      const tokenData = {
        ...verificationToken,
        expires: new Date(verificationToken.expires),
        createdAt: new Date()
      };
      
      await db.collection('verification_tokens').insertOne(tokenData);
      
      return tokenData as any;
    },

    async useVerificationToken(params) {
      const { db } = await connectToDatabase();
      
      const token = await db.collection('verification_tokens').findOne({
        identifier: params.identifier,
        token: params.token
      });
      
      if (token) {
        await db.collection('verification_tokens').deleteOne({
          identifier: params.identifier,
          token: params.token
        });
      }
      
      return token ? {
        ...token,
        id: token._id.toString(),
        expires: token['expires']
      } as any : null;
    }
  };
}