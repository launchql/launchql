import Networks from '@pyramation/crypto-networks';
import { verifyMessage } from '@pyramation/crypto-keys';
import pgQueryWithContext from '@pyramation/pg-query-context';

const { makeExtendSchemaPlugin, gql } = require('graphile-utils');

const PublicKeySignature = (svc) => {
  const net = svc.pubkey_challenge[0];
  const privSchema = svc.pubkey_challenge[1];
  const f1 = svc.pubkey_challenge[2];
  const f2 = svc.pubkey_challenge[3];
  const f3 = svc.pubkey_challenge[4];
  const f4 = svc.pubkey_challenge[5];

  return makeExtendSchemaPlugin(() => ({
    typeDefs: gql`
      input CreateUserAccountWithPublicKeyInput {
        publicKey: String!
      }

      input GetMessageForSigningInput {
        publicKey: String!
      }

      input VerifyMessageForSigningInput {
        publicKey: String!
        message: String!
        signature: String!
      }

      type createUserAccountWithPublicKeyPayload {
        challenge: String!
      }

      type getMessageForSigningPayload {
        challenge: String!
      }

      type verifyMessageForSigningPayload {
        access_token: String!
        access_token_expires_at: Datetime!
      }

      extend type Mutation {
        createUserAccountWithPublicKey(
          input: CreateUserAccountWithPublicKeyInput
        ): createUserAccountWithPublicKeyPayload
        getMessageForSigning(
          input: GetMessageForSigningInput
        ): getMessageForSigningPayload
        verifyMessageForSigning(
          input: VerifyMessageForSigningInput
        ): verifyMessageForSigningPayload
      }
    `,
    resolvers: {
      Mutation: {
      async createUserAccountWithPublicKey(parent, args, context, _info) { // eslint-disable-line
          const { env } = context;
          const { pgClient } = context;
          const publicKey = args.input.publicKey;

          const {
            rows: [user]
          } = await pgQueryWithContext({
            client: pgClient,
            context: {
              role: 'anonymous'
            },
            query: `SELECT * FROM "${privSchema}".${f1}($1)`,
            variables: [publicKey]
          });

          const {
            rows: [{ [f2]: challenge }]
          } = await pgQueryWithContext({
            client: pgClient,
            context: {
              role: 'anonymous'
            },
            query: `SELECT * FROM "${privSchema}".${f2}($1)`,
            variables: [publicKey]
          });

          return {
            challenge
          };
        },
      async getMessageForSigning(parent, args, context, _info) { // eslint-disable-line
          const { env } = context;
          const { pgClient } = context;
          const publicKey = args.input.publicKey;

          const {
            rows: [{ [f2]: challenge }]
          } = await pgQueryWithContext({
            client: pgClient,
            context: {
              role: 'anonymous'
            },
            query: `SELECT * FROM "${privSchema}".${f2}($1)`,
            variables: [publicKey]
          });

          if (!challenge) {
            throw new Error('NO_ACCOUNT_EXISTS');
          }

          return {
            challenge
          };
        },
      async verifyMessageForSigning(parent, args, context, _info) { // eslint-disable-line
          const { env } = context;
          const { pgClient } = context;
          const publicKey = args.input.publicKey;
          const message = args.input.message;
          const signature = args.input.signature;

          const network = Networks[net];
          const result = verifyMessage(message, publicKey, signature, network);

          if (!result) {
            await pgQueryWithContext({
              client: pgClient,
              context: {
                role: 'anonymous'
              },
              query: `SELECT * FROM "${privSchema}".${f3}($1)`,
              variables: [publicKey]
            });
            throw new Error('BAD_SIGNIN');
          }

          const {
            rows: [token]
          } = await pgQueryWithContext({
            client: pgClient,
            context: {
              role: 'anonymous'
            },
            query: `SELECT * FROM "${privSchema}".${f4}($1, $2)`,
            variables: [publicKey, message]
          });

          if (!token || !token.access_token) {
            throw new Error('BAD_SIGNIN');
          }

          return {
            access_token: token.access_token,
            access_token_expires_at: token.access_token_expires_at
          };
        }
      }
    }
  }));
};

module.exports = PublicKeySignature;
