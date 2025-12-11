import app from '@launchql/knative-job-fn';
import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import { generate } from '@launchql/mjml';
import { send } from '@launchql/postmaster';

const GetUser = gql`
  query GetUser($userId: UUID!) {
    user(id: $userId) {
      username
      displayName
      profilePicture
    }
  }
`;

const GetDatabaseInfo = gql`
  query GetDatabaseInfo($databaseId: UUID!) {
    database(id: $databaseId) {
      sites {
        nodes {
          domains {
            nodes {
              subdomain
              domain
            }
          }
          logo
          title
          siteThemes {
            nodes {
              theme
            }
          }
          siteModules(condition: { name: "legal_terms_module" }) {
            nodes {
              data
            }
          }
        }
      }
    }
  }
`;

type SendEmailParams = {
  email_type: 'invite_email' | 'forgot_password' | 'email_verification';
  email: string;
  invite_token?: string;
  sender_id?: string;
  user_id?: string;
  reset_token?: string;
  email_id?: string;
  verification_token?: string;
};

type GraphQLContext = {
  client: GraphQLClient;
  meta: GraphQLClient;
  databaseId: string;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
};

const createGraphQLClient = (url: string): GraphQLClient => {
  const headers: Record<string, string> = {};

  if (process.env.GRAPHQL_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GRAPHQL_AUTH_TOKEN}`;
  }

  return new GraphQLClient(url, { headers });
};

export const sendEmailLink = async (
  params: SendEmailParams,
  context: GraphQLContext
) => {
  const { client, meta, databaseId } = context;

  if (!params.email_type) {
    return { missing: 'email_type' };
  }
  if (!params.email) {
    return { missing: 'email' };
  }

  const databaseInfo = await meta.request<any>(GetDatabaseInfo, {
    databaseId
  });

  const site = databaseInfo?.database?.sites?.nodes?.[0];
  if (!site) {
    throw new Error('Site not found for database');
  }

  const legalTermsModule = site.siteModules?.nodes?.[0];
  const domainNode = site.domains?.nodes?.[0];
  const theme = site.siteThemes?.nodes?.[0]?.theme;

  if (!legalTermsModule || !domainNode || !theme) {
    throw new Error('Missing site configuration for email');
  }

  const subdomain = domainNode.subdomain;
  const domain = domainNode.domain;
  const supportEmail = legalTermsModule.data.emails.support;
  const logo = site.logo?.url;
  const company = legalTermsModule.data.company;
  const website = company.website;
  const nick = company.nick;
  const name = company.name;
  const primary = theme.primary;

  const baseUrl = 'https://' + (subdomain ? [subdomain, domain].join('.') : domain);
  const url = new URL(baseUrl);

  let subject: string;
  let subMessage: string;
  let linkText: string;

  let inviterName: string | undefined;

  switch (params.email_type) {
    case 'invite_email': {
      if (!params.invite_token || !params.sender_id) {
        return { missing: 'invite_token_or_sender_id' };
      }
      url.pathname = 'register';
      url.searchParams.append('invite_token', params.invite_token);
      url.searchParams.append('email', params.email);

      const inviter = await client.request<any>(GetUser, {
        userId: params.sender_id
      });
      inviterName = inviter?.user?.displayName;

      if (inviterName) {
        subject = `${inviterName} invited you to ${nick}!`;
        subMessage = `You've been invited to ${nick}`;
      } else {
        subject = `Welcome to ${nick}!`;
        subMessage = `You've been invited to ${nick}`;
      }
      linkText = 'Join Us';
      break;
    }
    case 'forgot_password': {
      if (!params.user_id || !params.reset_token) {
        return { missing: 'user_id_or_reset_token' };
      }
      url.pathname = 'reset-password';
      url.searchParams.append('role_id', params.user_id);
      url.searchParams.append('reset_token', params.reset_token);
      subject = `${nick} Password Reset Request`;
      subMessage = 'Click below to reset your password';
      linkText = 'Reset Password';
      break;
    }
    case 'email_verification': {
      if (!params.email_id || !params.verification_token) {
        return { missing: 'email_id_or_verification_token' };
      }
      url.pathname = 'verify-email';
      url.searchParams.append('email_id', params.email_id);
      url.searchParams.append('verification_token', params.verification_token);
      subject = `${nick} Email Verification`;
      subMessage = 'Please confirm your email address';
      linkText = 'Confirm Email';
      break;
    }
    default:
      return false;
  }

  const link = url.href;

  const html = generate({
    title: subject,
    link,
    linkText,
    message: subject,
    subMessage,
    bodyBgColor: 'white',
    headerBgColor: 'white',
    messageBgColor: 'white',
    messageTextColor: '#414141',
    messageButtonBgColor: primary,
    messageButtonTextColor: 'white',
    companyName: name,
    supportEmail,
    website,
    logo,
    headerImageProps: {
      alt: 'logo',
      align: 'center',
      border: 'none',
      width: '162px',
      paddingLeft: '0px',
      paddingRight: '0px',
      paddingBottom: '0px',
      paddingTop: '0'
    }
  });

  await send({
    to: params.email,
    subject,
    html
  });

  return {
    complete: true
  };
};

// HTTP/Knative entrypoint (used by @launchql/knative-job-fn wrapper)
app.post('*', async (req: any, res: any, next: any) => {
  try {
    const params = (req.body || {}) as SendEmailParams;

    const databaseId =
      req.get('X-Database-Id') || req.get('x-database-id') || process.env.DEFAULT_DATABASE_ID;
    if (!databaseId) {
      return res.status(400).json({ error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID' });
    }

    const graphqlUrl = getRequiredEnv('GRAPHQL_URL');
    const metaGraphqlUrl = process.env.META_GRAPHQL_URL || graphqlUrl;

    const client = createGraphQLClient(graphqlUrl);
    const meta = createGraphQLClient(metaGraphqlUrl);

    const result = await sendEmailLink(params, {
      client,
      meta,
      databaseId
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default app;

