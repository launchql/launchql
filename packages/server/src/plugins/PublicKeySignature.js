import Networks from '@pyramation/crypto-networks';
import { verifyMessage } from '@pyramation/crypto-keys';
import pgQueryWithContext from '@pyramation/pg-query-context';

const { makeExtendSchemaPlugin, gql } = require('graphile-utils');

const PublicKeySignature = (pubkey_challenge) => {
  const {
    schema,
    crypto_network,
    sign_up_unique_key,
    sign_in_request_challenge,
    sign_in_record_failure,
    sign_in_with_challenge
  } = pubkey_challenge;

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
        message: String!
      }

      type getMessageForSigningPayload {
        message: String!
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
            query: `SELECT * FROM "${schema}".${sign_up_unique_key}($1)`,
            variables: [publicKey]
          });

          const {
            rows: [{ [sign_in_request_challenge]: message }]
          } = await pgQueryWithContext({
            client: pgClient,
            context: {
              role: 'anonymous'
            },
            query: `SELECT * FROM "${schema}".${sign_in_request_challenge}($1)`,
            variables: [publicKey]
          });

          return {
            message
          };
        },
      async getMessageForSigning(parent, args, context, _info) { // eslint-disable-line
          const { env } = context;
          const { pgClient } = context;
          const publicKey = args.input.publicKey;

          const {
            rows: [{ [sign_in_request_challenge]: message }]
          } = await pgQueryWithContext({
            client: pgClient,
            context: {
              role: 'anonymous'
            },
            query: `SELECT * FROM "${schema}".${sign_in_request_challenge}($1)`,
            variables: [publicKey]
          });

          if (!message) {
            throw new Error('NO_ACCOUNT_EXISTS');
          }

          return {
            message
          };
        },
      async verifyMessageForSigning(parent, args, context, _info) { // eslint-disable-line
          const { env } = context;
          const { pgClient } = context;
          const publicKey = args.input.publicKey;
          const message = args.input.message;
          const signature = args.input.signature;

          const network = Networks[crypto_network];
          const result = verifyMessage(message, publicKey, signature, network);

          if (!result) {
            await pgQueryWithContext({
              client: pgClient,
              context: {
                role: 'anonymous'
              },
              query: `SELECT * FROM "${schema}".${sign_in_record_failure}($1)`,
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
            query: `SELECT * FROM "${schema}".${sign_in_with_challenge}($1, $2)`,
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
