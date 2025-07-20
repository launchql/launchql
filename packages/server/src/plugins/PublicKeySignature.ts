// import Networks from '@pyramation/crypto-networks';
// import { verifyMessage } from '@pyramation/crypto-keys';
import type { Request } from 'express';
import type { Plugin } from 'graphile-build';
import { gql,makeExtendSchemaPlugin } from 'graphile-utils';
import type { ClientBase } from 'pg';
import pgQueryWithContext from 'pg-query-context';

interface Context {
  pgClient: ClientBase;
  req: Request;
  env: Record<string, any>;
}

export interface PublicKeyChallengeConfig {
  schema: string;
    crypto_network: string;
    // crypto_network: keyof typeof Networks;
  sign_up_with_key: string;
  sign_in_request_challenge: string;
  sign_in_record_failure: string;
  sign_in_with_challenge: string;
}

export const PublicKeySignature = (pubkey_challenge: PublicKeyChallengeConfig): Plugin => {
  const {
    schema,
    crypto_network,
    sign_up_with_key,
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
        async createUserAccountWithPublicKey(
          _parent: any,
          args: { input: { publicKey: string } },
          context: Context
        ) {
          const { pgClient } = context;
          const { publicKey } = args.input;

          await pgQueryWithContext({
            client: pgClient,
            context: { role: 'anonymous' },
            query: `SELECT * FROM "${schema}".${sign_up_with_key}($1)`,
            variables: [publicKey]
          });

          const {
            rows: [{ [sign_in_request_challenge]: message }]
          } = await pgQueryWithContext({
            client: pgClient,
            context: { role: 'anonymous' },
            query: `SELECT * FROM "${schema}".${sign_in_request_challenge}($1)`,
            variables: [publicKey]
          });

          return { message };
        },

        async getMessageForSigning(
          _parent: any,
          args: { input: { publicKey: string } },
          context: Context
        ) {
          const { pgClient } = context;
          const { publicKey } = args.input;

          const {
            rows: [{ [sign_in_request_challenge]: message }]
          } = await pgQueryWithContext({
            client: pgClient,
            context: { role: 'anonymous' },
            query: `SELECT * FROM "${schema}".${sign_in_request_challenge}($1)`,
            variables: [publicKey]
          });

          if (!message) throw new Error('NO_ACCOUNT_EXISTS');

          return { message };
        },

        async verifyMessageForSigning(
          _parent: any,
          args: { input: { publicKey: string; message: string; signature: string } },
          context: Context
        ) {
          const { pgClient } = context;
          const { publicKey, message, signature } = args.input;

          //   const network = Networks[crypto_network];
          const network = 'btc';
          //   const result = verifyMessage(message, publicKey, signature, network);
          // TODO implement using interchainJS?
          const result = false;

          if (!result) {
            await pgQueryWithContext({
              client: pgClient,
              context: { role: 'anonymous' },
              query: `SELECT * FROM "${schema}".${sign_in_record_failure}($1)`,
              variables: [publicKey]
            });
            throw new Error('BAD_SIGNIN');
          }

          const {
            rows: [token]
          } = await pgQueryWithContext({
            client: pgClient,
            context: { role: 'anonymous' },
            query: `SELECT * FROM "${schema}".${sign_in_with_challenge}($1, $2)`,
            variables: [publicKey, message]
          });

          if (!token?.access_token) throw new Error('BAD_SIGNIN');

          return {
            access_token: token.access_token,
            access_token_expires_at: token.access_token_expires_at
          };
        }
      }
    }
  }));
};

export default PublicKeySignature;
